---
id: image-upload
project: fullstack-platform
title: Support image uploads for covers and inline images
summary: >-
  Let writers add a cover image and drop images into their posts. The browser uploads straight to an S3 bucket using a short-lived signed URL from your API, and your database stores only the URL.
time: 4-6 hours
doneWhen:
  - You can set a cover image on a post and see it on the post's card, and an inline image appears in the preview where you inserted it
  - Your database has no binary columns; posts store only an image URL on your bucket's host
  - Asking `/api/uploads` to sign a 20 MB file, or an `image/svg+xml` file, returns 400 and no URL
  - "Without a session cookie, `/api/uploads` returns 401"
  - Setting `coverImageUrl` to an image on some other website through the API returns 400
docs:
  - label: "Amazon S3: Uploading objects with presigned URLs"
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
  - label: "Amazon S3: Cross-origin resource sharing (CORS)"
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html
  - label: "OWASP: File Upload Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
  - label: "Next.js: Image component (remotePatterns)"
    url: https://nextjs.org/docs/app/api-reference/components/image
  - label: "MDN: Using files from web applications"
    url: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
---

## What you're building

In the editor, a "Cover image" button opens a file picker. Choose a photo and, a second later, it appears at the top of the post. A second button, "Insert image", uploads a picture and drops a markdown image tag into the text at the cursor, and the preview shows it.

The image bytes never pass through your server or your database. Your API only hands out permission slips: a signed URL allowing one upload, of one allowed type, to one location you chose, for about a minute.

## Why it matters

Nearly every product handles user files, and presigned URLs are the standard way: big uploads stay off your servers, and binary data stays out of your database, where it would bloat backups and slow queries. Upload endpoints are also a classic attack surface: oversized files, disguised types, files that run scripts. Enforcing the rules on the server, and knowing why the file picker's filter doesn't count, is the security thinking full-stack roles need.

## Before you start

- **Object storage.** A service that stores files ("objects") under keys like `u/123/abc.webp` and serves them over HTTPS. Cloudflare R2 and others copy Amazon S3's API, so the same SDK works with a different endpoint. Check your provider's pricing and free-tier pages before you start, as they change.
- **Presigned URL.** A URL your server signs with its secret key. It allows one specific operation (PUT this key, with this content type) until it expires. The browser can use it without ever seeing your keys. The [S3 guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html) explains the mechanics.
- **CORS.** By default, a browser blocks a page on `localhost:3000` from sending a PUT to a different origin, such as your bucket. The bucket must list your site's origins in its CORS configuration.
- **Least privilege.** The access key your app uses should be able to do only what the app does: put, get and delete objects in this one bucket. If it leaks, the damage stays small.

## Build it step by step

### Step 1: Set up the bucket and a narrow key

Create a bucket. Create an IAM user (or the equivalent on your provider) with a policy allowing only `s3:PutObject`, `s3:GetObject` and `s3:DeleteObject` on that bucket, and generate an access key for it. Add a CORS rule that allows `PUT` from `http://localhost:3000` (and later your production URL), with the `Content-Type` header allowed. For readers to see images, the simplest option is a bucket policy allowing public `GetObject` on your uploads prefix only. S3 blocks public access by default, so you'll change that setting for this bucket deliberately.

```bash
# .env.local (fake values)
S3_REGION=ap-south-1
S3_BUCKET=inkwell-dev-uploads
S3_ACCESS_KEY_ID=AKIAEXAMPLE
S3_SECRET_ACCESS_KEY=example-secret
S3_PUBLIC_BASE_URL=https://inkwell-dev-uploads.s3.ap-south-1.amazonaws.com
```

Check it: upload a test file in the provider's console and open its public URL in a private window. It loads.

### Step 2: Write the signing endpoint

`POST /api/uploads` starts like every write: `requireUserId()`, then Zod. The body says what the client wants to upload: `{ contentType, size, postId }`. Validate on the server:

- `contentType` is one of `image/jpeg`, `image/png`, `image/webp` or `image/gif`. Leave out `image/svg+xml`: SVG files can contain scripts.
- `size` is at most 5 MB.
- `postId` is a post the caller owns, checked with your scoped data-layer query.

Then **you** choose the key, never the client: something like `u/<userId>/<random uuid>.<extension for that type>`. Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`, build a `PutObjectCommand` with the bucket, key and content type, and sign it with `getSignedUrl(client, command, { expiresIn: 60 })`. Return `{ uploadUrl, key }`.

Check it: `curl` the endpoint with your cookie and `"contentType":"image/svg+xml"`. You get 400. With `image/png` and a small size you get a URL.

### Step 3: Upload from the browser

In the editor, a hidden `<input type="file" accept="image/*">` sits behind each button. When a file is picked, read its `type` and `size` from the `File` object, ask your API for a URL, then send the file directly with `fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })`. The `Content-Type` you send must match the one you signed exactly, or S3 rejects the request with `SignatureDoesNotMatch`.

Check it: pick a photo. The Network tab shows a POST to your API, then a PUT to the bucket returning 200, and the object appears under your user's prefix.

### Step 4: Confirm the upload on the server

The signed URL fixes where the upload goes and its claimed type, but don't rely on it alone to limit size. After the PUT, the client calls `POST /api/uploads/complete` with `{ key }`. The server reads the object's real size and type with `HeadObject`, deletes it if either breaks your rules, and otherwise returns its public URL.

```text
complete(key):
    require key starts with "u/" + userId + "/"        -> else 403
    meta = HeadObject(key)                              -> 404 if missing
    if meta.ContentLength > LIMIT or type not allowed:  DeleteObject(key); 400
    return { url: publicBaseUrl + "/" + key }
```

Check it: PUT a 20 MB file to a URL signed for a small one, then call `complete`. Either the provider rejects the PUT, or `complete` deletes the object and returns 400. Either way, the bucket doesn't keep it.

### Step 5: Save the URL, and only your URLs

For a cover, `PATCH` the post with `coverImageUrl`. Tighten its Zod rule from the CRUD milestone: the URL must start with your `S3_PUBLIC_BASE_URL`. Otherwise anyone could set their cover to an image on another site, for example a tracking pixel that logs every reader's IP address. For inline images, insert `![](url)` into the textarea at `selectionStart` and update state. The writer types the alt text between the brackets.

Show covers with `next/image`, which needs your bucket's host in `images.remotePatterns` in `next.config`. Without it, you'll see an error saying the hostname isn't configured.

Check it: set a cover, refresh, and it's still there. Then `PATCH` a cover URL on `example.com` with `curl`. You get 400.

### Step 6: Show progress and failure

Disable the button and show "Uploading..." while the requests run. If one fails, show a message the writer can act on ("That file is over 5 MB"), using the error your API returned. Never leave a spinner running forever.

Check it: try a PDF, then a huge photo, then turn off Wi-Fi mid-upload. Each one ends in a clear message, not a frozen button.

## Common mistakes

- **Missing CORS on the bucket.** Symptom: the console says the PUT was "blocked by CORS policy", and the response has no `Access-Control-Allow-Origin` header. Fix: add your site's origins, the `PUT` method and the `Content-Type` header to the bucket's CORS rules.
- **A content-type mismatch.** Symptom: 403 with `SignatureDoesNotMatch` in the response. Fix: send exactly the `Content-Type` you signed, taken from the same `file.type`.
- **Trusting the file picker.** Symptom: `curl` can get a signed URL for any type and any size. Fix: validate type and size in the signing endpoint, and verify again in `complete`.
- **Letting the client choose the key.** Symptom: one user can overwrite another's images by guessing a filename. Fix: the server builds keys from the user id and a random uuid.
- **Using your root or admin keys.** Symptom: nothing, until a leak hands over your whole cloud account. Fix: a dedicated key limited to one bucket and three actions.

## Say it in the interview

"Images never touch my server or my database. The API signs a 60-second URL for one key, which the server chose under the user's prefix, and only for an allowlisted image type under 5 MB. The browser uploads straight to S3. Then a confirm step reads the object's real size and deletes anything that breaks the rules. Posts store only the URL, and the schema rejects URLs that aren't on my bucket. The tradeoff is two round trips per upload, in exchange for my server never handling file bytes."

## Stretch goals

- On AWS S3, switch to a presigned POST with a `content-length-range` condition, so the storage service rejects oversized files before they land.
- Resize uploads into a few fixed widths and serve the right one with `srcset`.
