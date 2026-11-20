---
id: notifications-queue
project: capstone
title: Queue-driven notifications
summary: >-
  Likes, follows and replies enqueue small events. A worker aggregates them into grouped rows such as "Ana and 12 others liked your post", and the client polls an unread count. The request path only inserts the like and enqueues; all the grouping lives in the worker.
time: 6-8 hours
doneWhen:
  - "`POST /posts/:id/like` does one insert, one enqueue and responds, with no notification query in its path (check the query log)"
  - Thirteen different users liking one post produce one notification row reading "user_1 and 12 others liked your post"
  - Liking your own post, or liking, unliking and liking again, never notifies twice
  - After you read a grouped notification, the next like on that post starts a new unread row instead of reviving the old one
  - Running the same notify job twice leaves the actor count unchanged
  - The client's unread badge updates within one polling interval of a like
docs:
  - label: "BullMQ: Workers"
    url: https://docs.bullmq.io/guide/workers
  - label: "BullMQ: Job IDs"
    url: https://docs.bullmq.io/guide/jobs/job-ids
  - label: "PostgreSQL: INSERT and ON CONFLICT"
    url: https://www.postgresql.org/docs/current/sql-insert.html
  - label: "PostgreSQL: Partial unique indexes (CREATE INDEX)"
    url: https://www.postgresql.org/docs/current/sql-createindex.html
  - label: "MDN: Server-sent events"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
---

## What you're building

A bell icon with an unread count. Open it and you see grouped notifications: "Ana and 12 others liked your post", "Ravi started following you", "Meera replied: nice shot!". Likes on one post collapse into one line until you read it, and then a new like starts a fresh line.

Behind the bell is a queue. A like, follow or reply writes its row, drops a tiny event on the `notify` queue and returns. A worker turns events into grouped rows, and the client polls every 15 seconds or so.

## Why it matters

Same principle as the media pipeline: keep work off the request path when nobody is waiting for it. A like should take a few milliseconds whether the post has 3 likes or 3,000. It also teaches the two properties every queue consumer needs: idempotency, because jobs can run twice, and order-independence, because events can arrive out of order.

## Before you start

- **Event vs notification.** An event is a fact ("user 7 liked post 42"). A notification is what you show. The queue carries events, and the worker writes notifications.
- **Aggregation key.** What makes two events belong to the same line. For likes, it's `(recipient, type, post)`. For follows, it's `(recipient, type)`, which gives "Ana and 4 others followed you". Replies usually aren't grouped, because each one has its own text.
- **Partial unique index.** A unique index with a `WHERE` clause, such as unique on `(recipient_id, type, target_id) WHERE read_at IS NULL`. It allows only one *unread* group per key, while read groups pile up as history.
- **Upsert.** `INSERT ... ON CONFLICT ... DO UPDATE` creates the group if it doesn't exist and updates it if it does, in one atomic statement. Two workers can't create two groups at once.
- **Polling vs streaming.** Polling `GET /notifications/unread-count` every 15 seconds is simple and works through any proxy. Server-sent events push updates instantly, but they hold a connection open per user. Start with polling.

## Build it step by step

### Step 1: Model notifications and actors

Two tables. `notifications` holds the group, and `notification_actors` records who is in it. The actors table is what makes the count idempotent: you can only be in a group once.

```text
notifications        id, recipient_id, type ('like'|'follow'|'reply'), target_id null,
                     actor_count, latest_actor_ids (up to 3), preview text null,
                     updated_at, read_at null
  unique (recipient_id, type, target_id) WHERE read_at IS NULL   -- one open group per key
notification_actors  PK (notification_id, actor_id)
```

For follow groups `target_id` is null, and nulls are never equal in a unique index. Use a fixed placeholder value, or `NULLS NOT DISTINCT` on Postgres 15 or later.

Check it: inserting two unread rows with the same key fails, and inserting one after marking the first as read succeeds.

### Step 2: Emit events from the request path

In the like handler, insert into `likes` with `ON CONFLICT DO NOTHING`. Only if a row was inserted, increment the post's like count and enqueue `{ type: "like", actorId, postId, recipientId, requestId }` on the `notify` queue, after the commit. Do the same for follows and replies. Skip the enqueue when the actor is the recipient. Nobody wants "You liked your own post".

Check it: hammer the like button 10 times. There's one `likes` row and one job in the queue.

### Step 3: Aggregate in the worker

The `notify` worker, for a grouped type:

```text
in one transaction:
    still valid? (does the like still exist? is the actor not blocked?) -> else stop
    upsert the open group for (recipient, type, target), returning its id
    insert (group id, actor) into notification_actors, on conflict do nothing
    if that insert added a row:
        actor_count += 1; put actor at the front of latest_actor_ids (keep 3)
        updated_at = now()
```

Two details make the upsert work with a partial index. First, the `ON CONFLICT` clause must repeat the index's columns and its `WHERE read_at IS NULL`, so Postgres can match it to that index. Second, `DO NOTHING` returns no row on conflict, so use `DO UPDATE` with a harmless assignment, which makes `RETURNING id` always give you the group.

Because the count only moves when a new actor row is inserted, a retried job, a duplicated job, or a like-unlike-like all leave the count right. The validity check handles the case where the user unliked the post before the job ran.

Check it: have 13 seeded users like one post. There's one unread group with `actor_count` 13.

### Step 4: Render the text at read time

Store ids and counts, not sentences. `GET /notifications?cursor=` returns groups by `updated_at DESC` with the latest actors' usernames joined in, and the client turns `{ type: "like", actors: ["ana"], actorCount: 13 }` into the sentence. Renamed users then show their new name, and wording changes need no migration.

Check it: rename one actor's display name. The notification text updates on the next load.

### Step 5: Unread count and mark-as-read

`GET /notifications/unread-count` should be cheap, because every open tab calls it every 15 seconds. Back it with an index on `(recipient_id) WHERE read_at IS NULL`, or cache it in Redis for a few seconds with a rule in your invalidation table. `POST /notifications/read` sets `read_at` on everything up to a given id. The client polls with `setInterval`, and pauses when the tab is hidden (`document.visibilityState`), so background tabs don't hammer the API.

Check it: like a post from another account. The badge changes within one polling interval. Open the bell and mark all as read. Then like again from a third account: a new unread row appears, and the old row stays as read history.

### Step 6: Watch the queue, then record the tradeoff

Stop the worker and send 50 likes. The likes all succeed instantly, and the waiting count on the `notify` queue climbs. Start the worker and watch it drain. This is the property you built: the request path doesn't depend on the worker being up.

In your design doc, add the notifications design and its tradeoff. Notifications are **eventually consistent**: under load they may arrive seconds late, and if the worker is down they wait. In exchange, likes stay fast and independent of the worker. Note your polling interval and the rough request rate it implies (daily actives × tabs ÷ interval), and say when you'd switch to server-sent events.

Check it: you can quote the queue depth before and after the worker restart, and the doc names the consistency you chose.

## Common mistakes

- **Aggregating in the request.** Symptom: likes get slower as a post gets popular, because each one reads and rewrites the group in the handler. Fix: the handler only inserts and enqueues. The worker groups.
- **Counting events instead of actors.** Symptom: a flaky network or a retried job makes "13 others" become "14 others" with no new person. Fix: count via `notification_actors` inserts, never `actor_count + 1` on every job.
- **One unique key for read and unread.** Symptom: after you read a group, new likes silently update the old, already-read row, and the badge never lights up. Fix: make the unique index partial, `WHERE read_at IS NULL`.
- **Enqueueing before the like commits.** Symptom: the worker sometimes finds no like and drops the event, or notifies for a like that rolled back. Fix: enqueue after commit, and check validity in the worker.
- **Polling from hidden tabs.** Symptom: the unread-count endpoint dominates load-test traffic. Fix: pause polling in hidden tabs.

## Say it in the interview

"A like inserts one row and enqueues an event, and that's all the request does. A BullMQ worker upserts an open group keyed by recipient, type and post, using a partial unique index so read groups become history. It increments the count only when inserting the actor into a join table adds a row, so duplicate and retried jobs are harmless. The tradeoff is eventual consistency: if the worker falls behind, notifications arrive late, but likes never slow down. I went with polling every 15 seconds over server-sent events because it's simpler to scale, and I'd switch once the poll rate showed up as a real cost."

## Stretch goals

- Batch likes on very popular posts. Use a delayed job with a deterministic `jobId` per group (say five seconds), so 200 likes in a burst cause one group update instead of 200.
