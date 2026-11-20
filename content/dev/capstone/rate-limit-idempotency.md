---
id: rate-limit-idempotency
project: capstone
title: Rate limiting and idempotency keys
summary: >-
  Add sliding-window rate limits in Redis per user and per endpoint class (generous for reads, tight for writes), and accept an Idempotency-Key header on every mutation, so a retried "create post" replays the first response instead of creating a second post.
time: 6-8 hours
doneWhen:
  - Going over the write limit returns 429 with a `Retry-After` header, and requests succeed again once the window slides
  - Two API processes running side by side share one limit, because the counter lives in Redis
  - Sending the same `POST /posts` twice with one `Idempotency-Key` creates one post, and both responses have the same body and status
  - Reusing a key with a different body returns 422, and a duplicate sent while the first is still running returns 409
  - The posts table has a unique constraint that blocks a duplicate even if the Redis key is lost
  - Your design doc states whether the limiter fails open or closed when Redis is down, and why
docs:
  - label: "Redis: Scripting with Lua (EVAL)"
    url: https://redis.io/docs/latest/develop/programmability/eval-intro/
  - label: "Redis: Sorted sets"
    url: https://redis.io/docs/latest/develop/data-types/sorted-sets/
  - label: "MDN: 429 Too Many Requests"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429
  - label: "IETF draft: The Idempotency-Key HTTP header"
    url: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
  - label: "Stripe API: Idempotent requests"
    url: https://docs.stripe.com/api/idempotent_requests
---

## What you're building

Two protections in front of every route. A **rate limiter** decides, per signed-in user (or per IP when anonymous), whether a request fits the budget: reads generous, posting tight, sign-in tighter. Over budget, the API answers `429 Too Many Requests` and says when to retry.

An **idempotency layer** makes every mutation safe to retry. The client sends an `Idempotency-Key`, a UUID generated once per user action. If the same key arrives again, say because the phone lost signal after the post was created, the server returns the original response instead of doing the work twice.

## Why it matters

Clients retry: flaky networks, double taps and retry logic guarantee it. An API that isn't retry-safe creates duplicate posts and, in payments, double charges, which is why APIs like Stripe's support idempotency keys. You met the idea in [Lilypad Market's webhooks](/development/storefront/webhooks-orders), and here you make it general. Rate limiting protects shared resources from one noisy client. Huddle's was [in memory](/development/realtime-collab/rate-limit-abuse), while Ripple's lives in Redis, so it holds across many API processes. Together they let you say "clients can retry anything, safely".

## Before you start

- **Fixed vs sliding window.** A fixed window counts per calendar minute, so a user can spend the full budget at 10:00:59 and again at 10:01:00. A sliding window counts the last 60 seconds from *now*.
- **Sliding log in a sorted set.** One member per request, scored by timestamp: remove old members, count the rest, add the new one if under the limit. It's exact, but memory grows with the limit. The cheaper approximation weights two fixed-window counters.
- **Atomicity with Lua.** As separate commands, two concurrent requests can both see "99 of 100" and pass. A Lua script runs as one atomic step inside Redis (`defineCommand` in ioredis registers one).
- **Request fingerprint.** A hash of method, path and body, to catch a key reused for a *different* request: a client bug to reject, not replay.
- **Fail open vs fail closed.** If Redis is down, let requests through (available, unprotected) or reject them (protected, down). Pick per endpoint class.

## Build it step by step

### Step 1: Define endpoint classes and budgets

Put budgets in your design doc and one config file. These numbers are illustrative.

```json
{
  "read":   { "limit": 300, "windowSec": 60 },
  "write":  { "limit": 30,  "windowSec": 60 },
  "auth":   { "limit": 10,  "windowSec": 300, "keyBy": "ip" },
  "upload": { "limit": 20,  "windowSec": 3600 }
}
```

Tag each route with its class when you register it.

Check it: every route in your design doc's API surface has exactly one class.

### Step 2: Write the sliding-window check as one script

The key is `rl:{class}:{userId or ip}`. The script receives the key, the current time in milliseconds, the window and the limit.

```text
remove members with score <= now - window
count = number of members left
if count < limit:
    add member (now + a random suffix, so equal timestamps don't collide), score now
    set the key to expire after the window
    return allowed, remaining = limit - count - 1
else:
    oldest = lowest score left
    return denied, retry_after = oldest + window - now
```

Rate-limit and idempotency keys live in the cache Redis. If memory fills up, LRU eviction may drop them, which behaves like failing open. That's acceptable here, and it's one more reason for the database backstop in step 6.

Use the Redis server's clock or the API's clock, but use the same one everywhere. Mixing clocks across machines makes windows drift.

Check it: in a test, call the script 31 times in a tight loop with a write budget of 30. Exactly one call should be denied.

### Step 3: Wire it into middleware with useful headers

The middleware runs after authentication (so it knows the user) and before validation. On deny, return 429 with `Retry-After` in seconds and a small JSON error. On every response, it's good practice to include the remaining budget, using the `RateLimit` header fields from the IETF draft or the widely used `X-RateLimit-Remaining`. The web client should read `Retry-After` and disable the Post button until then, instead of letting users hammer it.

Check it: `for i in $(seq 1 35); do curl -s -o /dev/null -w "%{http_code}\n" ...; done` against a write endpoint prints 30 successes, then 429s. Wait a minute and it recovers.

### Step 4: Decide failure behaviour

Wrap the script call so a Redis error doesn't crash the request. A reasonable default: reads **fail open** (a Redis blip shouldn't take the site down), and auth **fails closed** (an unprotected sign-in endpoint invites password guessing). Writes are your call. Log every fallback, so you know when it happened.

Check it: stop the cache Redis. The feed still loads, sign-in returns 503, and the logs say why.

### Step 5: Add the idempotency middleware

For every mutating route, read `Idempotency-Key` (require it on `POST /posts`, and accept it everywhere else). The flow, keyed by `idem:{userId}:{key}`:

```text
fingerprint = hash(method, route, body)
try SET key {state: "running", fingerprint} NX EX 60
if it was set:  run the handler
    on 2xx or 4xx: store {state: "done", fingerprint, status, body} with EX 86400
    on 5xx:        delete the key, so the client may retry for real
if it existed:
    different fingerprint -> 422
    state running         -> 409, with Retry-After: 1
    state done            -> replay the stored status and body exactly
```

Store the exact response, status included: a replayed `201 Created` must look identical.

Check it: send the same create-post request twice with one key and compare the two response bodies with `diff`. They're identical, and the database has one post.

### Step 6: Add a database backstop for creates

Redis isn't transactional with Postgres. If the API crashes after inserting the post but before storing the response, the `running` key expires, and a retry would insert again. Close that gap for creates. Add a nullable `idempotency_key` column to `posts` with a unique constraint on `(author_id, idempotency_key)`. On a conflict, look up the existing post and return it as if it were new.

Check it: delete the Redis key between two identical requests. The second one still returns the original post and doesn't create a twin.

### Step 7: Write both tradeoffs into the design doc

Add a "Resilience" section with two short decision records. **Rate limiting:** a sliding log (exact, memory grows with the limit) over two weighted counters (approximate, constant memory), plus your fail-open and fail-closed choices. **Idempotency:** Redis for the fast replay path, plus a unique constraint as the durable backstop for creates, with a 24-hour key lifetime. Also state what you don't guarantee: two different keys for the same click will create two posts, so the client must generate the key once per action, not once per attempt.

Check it: the doc says what happens if Redis dies mid-request, for both.

## Common mistakes

- **Separate Redis commands for the window.** Symptom: under a burst, users get a few requests over their limit. Fix: run remove, count and add as one Lua script.
- **Rate limiting before auth.** Symptom: everyone behind a college NAT shares one IP budget and gets 429s. Fix: limit signed-in traffic by user id.
- **Generating a new key on every retry.** Symptom: duplicates still happen, because the client's retry loop makes a fresh UUID each time. Fix: create the key when the user presses Post, and reuse it for every attempt of that action.
- **Caching 5xx responses under the key.** Symptom: a transient database error is "replayed" forever, and the client can never succeed. Fix: drop the key on server errors, and store only 2xx and 4xx results.
- **Ignoring the fingerprint.** Symptom: a buggy client reuses one key for two different posts, and the second silently returns the first. Fix: compare fingerprints and return 422 on a mismatch.

## Say it in the interview

"Every mutation accepts an `Idempotency-Key`. The first request takes a short Redis lock, and its 2xx or 4xx response is stored for a day. Duplicates replay it, conflicting bodies get 422, and in-flight duplicates get 409. Because Redis and Postgres can't commit together, creates also have a unique constraint on author and key, so a crash mid-request can't double-post. Rate limits are a sliding log in a Redis sorted set behind a Lua script, per user per endpoint class. The tradeoff I made explicitly: reads fail open when Redis is down, because availability matters more there, and sign-in fails closed, because protection does."

## Stretch goals

- Add a global limit on the media upload endpoint per IP, plus a separate daily byte budget per user, enforced in the worker after it knows the real file size.
