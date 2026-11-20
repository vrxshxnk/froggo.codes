---
id: media-pipeline
project: capstone
title: Media upload pipeline with background processing
summary: >-
  Photos go straight from the browser to object storage through a presigned URL. The API only records the post and enqueues a job, and a worker makes the thumbnails, runs a moderation stub and flips the post from processing to ready or failed.
time: 10-12 hours
doneWhen:
  - Uploading a photo never sends the file's bytes through your API (the network tab shows the PUT going to the bucket's host)
  - "`POST /posts` with a photo responds in well under 100 ms locally, and the post shows `processing` until the worker finishes"
  - The bucket holds resized variants for each upload, and the post page shows the small one, not the original
  - Stopping the worker leaves posts in `processing`, and restarting it processes them without any manual step
  - A corrupt file or a forced error ends with the post `failed` after the configured retries, never stuck in `processing`
  - Running the same job twice produces the same variants and the same final status, with no duplicates
docs:
  - label: "AWS S3: Uploading objects with presigned URLs"
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
  - label: "Cloudflare R2: Presigned URLs"
    url: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
  - label: "AWS SDK for JavaScript v3: s3-request-presigner"
    url: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-s3-request-presigner/
  - label: "BullMQ: Retrying failing jobs"
    url: https://docs.bullmq.io/guide/retrying-failing-jobs
  - label: "sharp (GitHub)"
    url: https://github.com/lovell/sharp
---

## What you're building

A user picks up to four photos and writes a caption. The browser uploads each file straight to your bucket, then creates the post, which appears at once with a "Processing..." placeholder. A second or two later it becomes a correctly sized image. A broken file ends as "Upload failed", never stuck on processing.

Your API never touches the image bytes. It hands out short-lived upload permission, records the upload and enqueues a job. The worker does the slow part.

## Why it matters

Photo and video platforms work like this: direct upload, asynchronous processing, a visible state while you wait. It teaches the async state machine, a record moving through `pending → processing → ready | failed`, driven by a separate process that may crash, retry or run twice. Getting it right, with no stuck rows and no double processing, is the core skill of backend work with queues.

## Before you start

- **Presigned URL.** A URL your server signs with its storage credentials. It allows exactly one operation (a PUT of this key, with this content type) until it expires. The browser uses it without ever seeing your secret keys. You built a simpler version in [Inkwell's image uploads](/development/fullstack-platform/image-upload).
- **Bucket CORS.** The browser uploads to the bucket's domain, so the bucket needs a CORS rule allowing `PUT` from your web origin.
- **BullMQ basics.** A `Queue` adds jobs, and a `Worker` runs an async function for each. If it throws, BullMQ retries per `attempts` and `backoff`, then moves the job to the failed set.
- **At-least-once delivery.** If a worker crashes mid-job, BullMQ treats the job as stalled and runs it again. So any job may run more than once, and every step must be safe to repeat.
- **Conditional update.** `UPDATE posts SET status = 'ready' WHERE id = $1 AND status = 'processing'` changes the row only if it's still in the expected state. The affected-row count tells you whether you won.

## Build it step by step

### Step 1: Model the states

Add a `media` table and a `status` column on `posts`. Draw the state machine in your design doc before writing any handler, including who is allowed to make each transition.

```text
media:  pending ──(client finished PUT)──► uploaded ──(worker)──► ready
                                                        └───────► failed
post:   processing ──(all media ready)──► ready
                   └─(any media failed)──► failed
text-only posts are created directly as ready
```

Check it: a CHECK constraint or enum rejects any other status.

### Step 2: Hand out the upload URL

`POST /media/uploads` takes `{ contentType, size }`. Validate both against an allowlist (`image/jpeg`, `image/png`, `image/webp`) and a maximum size. Create a `media` row with status `pending`, owned by the caller, with a server-chosen key such as `originals/<userId>/<mediaId>`. Never let the client choose the key. Then presign a `PutObjectCommand` for that key with `getSignedUrl` and a short expiry, around five minutes.

```json
{ "mediaId": "01J...", "uploadUrl": "https://<bucket-host>/originals/...&X-Amz-Signature=...", "expiresIn": 300 }
```

A presigned PUT doesn't reliably cap the file size by itself, so the worker checks the real size in step 5. If your provider supports presigned POST policies, a `content-length-range` condition enforces the cap at upload time. S3 does. Check your provider's docs.

Check it: `curl -X PUT --upload-file cat.jpg -H "Content-Type: image/jpeg" "<uploadUrl>"` returns 200, and the same URL fails after it expires.

### Step 3: Configure CORS and upload from the browser

Add a CORS rule to the bucket allowing `PUT` from `http://localhost:3000` and your production origin, with the `Content-Type` header. In `web`, send the file with `fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })`. If you want a progress bar, use `XMLHttpRequest` and its `upload.onprogress` event, since `fetch` has no upload progress.

Check it: in the network tab, the PUT goes to the bucket's host, not your API.

### Step 4: Create the post and enqueue the job

`POST /posts` takes `{ body, mediaIds }`. In one transaction, check that every media id belongs to the caller and is `pending`. Insert the post as `processing`, attach the media, and mark them `uploaded`. **After the commit**, add a `process-media` job with `{ postId, mediaIds, requestId }`, using the type from `packages/types`. Set `attempts: 3` with exponential backoff, and use `jobId: postId`, so a second enqueue of the same post is ignored while the first job still exists.

Enqueue after commit: if the transaction rolls back, the worker would get a job for a post that doesn't exist.

Check it: with the worker stopped, create a post. It responds fast, shows `processing`, and the waiting count rises by one.

### Step 5: Process in the worker

The worker handler, in order:

```text
load post + media; if post is no longer processing: return    # already done
for each media:
    HEAD the original -> reject if size or type is wrong
    download, auto-rotate from EXIF, strip metadata
    resize to widths [320, 960] as WebP; upload to variants/<mediaId>/<w>.webp
    moderation stub: a function returning "ok" or "flagged"
    update media: status ready, variants = [...keys]
conditionally update post processing -> ready
```

Deterministic variant keys make a rerun overwrite the same objects. Stripping EXIF matters because phone photos can carry GPS coordinates. `sharp` handles rotation, resizing, format and metadata in one pipeline.

Check it: a portrait phone photo comes out the right way up, and an EXIF viewer shows no GPS data on the variant.

### Step 6: Handle failure explicitly

Some failures are worth retrying (a network blip talking to the bucket) and some are not (a file that isn't an image). For permanent ones, throw BullMQ's `UnrecoverableError`, so it skips the remaining attempts. Listen for the job's final failure. In the worker's `failed` event, check `attemptsMade` against `attempts`. Then conditionally set the post and its media to `failed` with a short reason. The client polls `GET /posts/:id` every second or two while the post is `processing`, and stops once it isn't.

Check it: upload a text file renamed to `.jpg`. The post should go to `failed` with no retries. Make the bucket unreachable, and the job should retry three times, then fail.

### Step 7: Recover stuck posts, and write the tradeoff down

Add a scheduled job that re-enqueues or fails posts still `processing` after, say, 15 minutes: the safety net for anything the queue lost. In your design doc, record the choice of **async processing with a visible state** over **processing inside the request**. The cost is a more complex client and a state machine. The gain is create-post latency that doesn't depend on image size.

Check it: set a post's status to `processing` by hand with an old timestamp. The sweeper picks it up on its next run.

## Common mistakes

- **Enqueueing inside the transaction.** Symptom: the worker logs "post not found" for some jobs. Fix: commit first, then enqueue. The sweeper covers the rare crash between the two.
- **Trusting the client's content type and size.** Symptom: someone uploads a 2 GB file or an HTML page as `image/png`. Fix: the worker checks with `HeadObject` and by decoding the file, and rejects anything wrong.
- **Non-idempotent steps.** Symptom: a retried job creates duplicate variant rows, or flips a `failed` post back to `ready`. Fix: deterministic keys, and conditional status updates that check the current state.
- **Serving the original.** Symptom: the feed downloads 4 MB images. Fix: show the 320px or 960px variant, and keep originals private.
- **Missing bucket CORS.** Symptom: the browser console shows a CORS error on PUT, while `curl` with the same URL works. Fix: add a CORS rule for your web origin and the `Content-Type` header.

## Say it in the interview

"Uploads never touch the API. The client gets a five-minute presigned URL for a key the server chose, PUTs the file to the bucket, then creates the post, which starts as `processing`. A BullMQ worker verifies the file, strips EXIF, writes WebP variants under deterministic keys and flips the status with a conditional update, so a retried or duplicated job is harmless. The tradeoff is that the client has to handle a pending state and poll. I chose that over resizing in the request, so create-post latency stays flat whatever the image size."

## Stretch goals

- Support short videos. Use `ffmpeg` in the worker to transcode to a capped 720p MP4 and pull a poster frame, with a longer job timeout and its own queue.
