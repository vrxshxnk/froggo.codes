---
id: optimistic-ui
project: realtime-collab
title: Optimistic sends with reconciliation
summary: >-
  Show a message the instant the user presses Enter, then swap in the server's saved version by its tempId, or mark it failed with a retry button. A retry can never create a duplicate.
time: 3-4 hours
doneWhen:
  - Your message appears instantly in a faded "sending" state, even with devtools throttling set to Slow 3G
  - When the server confirms, the same bubble becomes a normal message in place, with no flicker or jump
  - If the ack doesn't arrive within 5 seconds, the message shows "Failed" and a Retry button
  - Retrying a message the server already saved does not create a second copy
  - Your other tabs show the message once, as a normal message
docs:
  - label: "socket.io: Acknowledgements and timeouts"
    url: https://socket.io/docs/v4/emitting-events/
  - label: "React: useReducer"
    url: https://react.dev/reference/react/useReducer
  - label: "MDN: crypto.randomUUID()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
  - label: "PostgreSQL: INSERT ... ON CONFLICT"
    url: https://www.postgresql.org/docs/current/sql-insert.html
---

## What you're building

Until now, a message appears only after the server saves and broadcasts it, and on a slow connection you feel the wait. Now, pressing Enter draws it immediately, faded with a small "sending" clock. A moment later it turns solid. If the network is bad, it turns red with "Failed to send" and a Retry button. Pressing Retry either sends it or, if the server had actually saved it the first time, quietly confirms it, without ever showing a duplicate.

## Why it matters

Likes, upvotes and message sends everywhere update the screen before the server agrees, then reconcile. Done properly, it's a small state machine (sending, sent, failed) whose confirmations can arrive in either order. It also forces you to solve idempotency: processing the same request twice has the same effect as once. That idea underpins reliable payments, retries and queues, and comes up in system design interviews often.

## Before you start

- **Optimistic update.** Changing the UI as if a request succeeded before it has. It feels instant, but you take on the job of correcting the screen when the request fails.
- **Reconciliation.** Matching the server's version of something to the placeholder you drew. The `tempId` you designed into the protocol is the matching key: the server echoes it in both the ack and `message:new`.
- **Ack timeouts.** `socket.timeout(5000).emit(event, payload, (err, response) => ...)` calls your callback with an error if no ack arrives in 5 seconds. Without a timeout, a lost ack means the callback never runs and the message sits in "sending" forever.
- **Idempotency key.** A value that identifies one logical request across retries. Here, `(author_id, temp_id)` is unique in the database, so a retried insert finds the existing row instead of creating a new one.

## Build it step by step

### Step 1: Extend the message shape on the client

A message in your reducer now carries a status. Confirmed messages have a real `id`, and pending ones have only a `tempId`.

```json
{ "tempId": "4b1f...", "id": null, "status": "sending", "body": "hi", "authorId": 3 }
{ "tempId": "4b1f...", "id": 1043, "status": "sent", "body": "hi", "authorId": 3, "sentAt": "..." }
{ "tempId": "9c2e...", "id": null, "status": "failed", "body": "you there?", "authorId": 3 }
```

Key messages by `tempId` while pending, and keep a lookup from `tempId` to `id` once confirmed, so both the ack and the broadcast can find the same entry. Write the reducer actions out before coding them: `sendStarted`, `sendConfirmed`, `sendFailed`, `messageReceived` and `retryStarted`.

Check it: for each action, you can say which statuses it may move from. `sendConfirmed` from `failed` is allowed: a late confirmation wins.

### Step 2: Render instantly, then emit

On submit, generate a `tempId` with `crypto.randomUUID()`, dispatch `sendStarted` so the message renders at the bottom with status `sending`, clear the input, and only then emit `message:send` with a 5-second ack timeout. Style `sending` with reduced opacity and a small clock icon, not a spinner, which would make fast sends feel slow.

Check it: set devtools throttling to Slow 3G. The message appears the moment you press Enter.

### Step 3: Reconcile in place, from whichever arrives first

Two things confirm a send: your ack callback and the `message:new` broadcast, which also reaches the sender. They can arrive in either order. Make both dispatch something that does the same thing: find the entry by `tempId` and, if it isn't already `sent`, give it the real `id`, `sentAt` and status `sent`. The second one to arrive finds it already confirmed and does nothing.

Swap the data inside the same entry, with the `tempId` as its React `key`, so React updates the existing bubble. Never move it. Even if the server's `sentAt` would sort it above someone else's message that arrived a moment earlier, leave it where the user saw it. Users forgive a slightly wrong order. They don't forgive text jumping under their cursor.

Check it: send five messages quickly from two windows at once. Every bubble turns solid where it was drawn, and nothing reorders while you watch.

### Step 4: Handle the other tabs

Your second tab, signed in as the same user, receives `message:new` with a `tempId` it has never seen. That's fine: it doesn't match a pending entry, so it's added as a normal confirmed message. Make sure `messageReceived` also ignores a message whose `id` you already have. History loads, broadcasts and (in the next milestone) catch-up fetches can all deliver the same message.

Check it: two tabs as Ana, one as Ravi. Send from tab 1. Each window shows the message exactly once.

### Step 5: Fail visibly, and make retries safe

When the ack callback gets a timeout error, or `{ ok: false }`, dispatch `sendFailed`. Render the message in red with "Failed to send" and a Retry button. Show the error code where it helps, for example "Too many messages, try again in 4s" for `rate_limited`. Never delete a failed message yourself.

Retry emits `message:send` again with the same `tempId`. Now the server must be idempotent. Change the insert to `ON CONFLICT (author_id, temp_id) DO NOTHING`. If it returns no row, the message was already saved, so select the existing row by that pair and carry on as if you'd just inserted it: broadcast it and ack it. Broadcasting a duplicate is harmless, because every client already ignores ids it has (step 4), and it covers the case where the first attempt saved the row but died before broadcasting.

Check it: add a dev-only `DEV_DROP_AFTER_SAVE=1` flag that inserts the row and then returns without broadcasting or acking, like a crash at the worst moment. The message goes to Failed after 5 seconds. Turn the flag off, restart, press Retry: it turns solid, the other window shows it once, and `psql` shows one row.

### Step 6: Test the race on purpose

Add a dev-only `DEV_SLOW_SAVE_MS=6000` that waits before the insert, so both the broadcast and the ack arrive just past your 5-second timeout. The message goes to Failed, then the late broadcast arrives and confirms it. Your reducer should let a late confirmation win: `failed` to `sent` is a valid transition. Then try the reverse: retry quickly before the late broadcast arrives. You should still end with one solid message and one row.

Check it: with that delay on, run through send, timeout, retry and late confirm three times. The database count and the on-screen count always match.

## Common mistakes

- **Swapping by removing and re-adding.** Symptom: the bubble flickers, or jumps to a different place when it's confirmed. Fix: update the same entry, with a stable React key.
- **Only listening for the ack (or only the broadcast).** Symptom: messages stay in "sending" when the other one arrives first or gets lost. Fix: both confirm, and confirming twice is a no-op.
- **No ack timeout.** Symptom: on a dropped connection, messages sit in "sending" forever, and the Retry button never appears. Fix: `socket.timeout(ms).emit(...)`.
- **Retrying with a new tempId.** Symptom: the receiver sees the message twice after a lost ack. Fix: the `tempId` belongs to the message, not to the attempt. Retries reuse it, and the unique constraint does the rest.
- **Clients that don't de-duplicate by id.** Symptom: after a retry, other users see the same message twice. Fix: `messageReceived` ignores any id already in state, so the server can safely re-send.

## Say it in the interview

"Sends are optimistic. The client draws the message with a tempId straight away, and it's confirmed when either the ack or the broadcast arrives, whichever comes first. If neither arrives in 5 seconds, it's marked failed with a retry. Retries are safe because `(author_id, temp_id)` is unique, so the server returns the existing row instead of inserting again. The tradeoff is that the user briefly sees a message the server hasn't accepted, so I made failure loud and kept failed messages on screen."

## Stretch goals

- Retry automatically once, after a short delay, before showing the Retry button.
