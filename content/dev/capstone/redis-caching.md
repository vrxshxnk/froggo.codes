---
id: redis-caching
project: capstone
title: Add Redis caching with deliberate invalidation
summary: >-
  Cache profiles, posts, counts and the first feed page in Redis with TTLs. Before writing any caching code, write down the invalidation rule for each key, and count hits and misses so you can prove the hit rate later.
time: 6-8 hours
doneWhen:
  - Your design doc has an invalidation table listing every cache key pattern, what it holds, its TTL and exactly what evicts it
  - Editing your bio shows the new bio on the very next profile load, not after the TTL
  - Loading the same profile twice runs the database query once (check the query log)
  - Hydrating a feed page uses one `MGET` for all its posts, then one SQL query for the misses only
  - Your logs or counters report hits and misses per key family, and you can quote a hit rate from a short local test
  - The cache Redis has a `maxmemory` limit and an `allkeys-lru` (or similar) eviction policy set
docs:
  - label: "Redis: Key eviction"
    url: https://redis.io/docs/latest/develop/reference/eviction/
  - label: "Redis: SET (EX, PX, NX options)"
    url: https://redis.io/docs/latest/commands/set/
  - label: "Redis: EXPIRE"
    url: https://redis.io/docs/latest/commands/expire/
  - label: "Redis: INFO"
    url: https://redis.io/docs/latest/commands/info/
---

## What you're building

Users only notice that pages feel faster. Profiles, posts, counts and the first feed page come from Redis when they can, and stay as correct as your design doc promised: your own edits show at once, other people's numbers may lag up to a minute.

The real deliverable is a table in your design doc: one row per cache key, its staleness rule, and a measured hit rate.

## Why it matters

A cache rewards you immediately and bills you later, with staleness bugs that are hard to reproduce. Writing each invalidation rule first makes you pay the thinking cost while it's cheap. If you can't state a key's rule in one sentence, you don't understand that data well enough to cache it. In interviews, "how do you keep it consistent?" always follows "I'd add a cache", and a table of rules with a measured hit rate beats "use a TTL".

## Before you start

- **Cache-aside.** The app checks Redis first. On a miss it reads Postgres, writes the result into Redis with a TTL, and returns it. Writes go to Postgres, and then the app deletes the affected cache keys. Redis never talks to Postgres itself.
- **TTL (time to live).** Every key expires on its own, so even buggy invalidation has bounded staleness. It's the backstop, not the plan.
- **Delete, don't update, on write.** Delete the key and let the next read refill it. Updating it from the write path invites races where an older value wins.
- **Eviction policy.** When Redis hits `maxmemory`, the policy decides what goes. `allkeys-lru` drops the least recently used keys, which suits a cache. That's why this is the cache Redis and never the queue Redis.
- **Cache stampede.** A hot key expires and hundreds of requests miss at once, all hitting Postgres.

## Build it step by step

### Step 1: Write the invalidation table first

In your design doc, add a table before writing any caching code. Here is a starting point. Adjust it to your own staleness promises from the design doc.

```text
key pattern          holds                          TTL     invalidated by
user:{id}            profile, without counts        10 min  DEL on profile edit
counts:user:{id}     followers, following           60 s    TTL only (≤ 60 s stale, accepted)
post:{id}            post body, media, author id    1 h     DEL on edit, delete, status change
counts:post:{id}     like and reply counts          30 s    TTL only
feed:{userId}:p1     first feed page: ids + cursor  30 s    DEL when that user posts, follows
                                                            or unfollows; TTL for everyone else
celebs:{userId}      popular accounts they follow   5 min   DEL on follow / unfollow
```

Notice the deliberate splits. Counts live apart from profiles and posts because they change far more often: if a like deleted `post:{id}`, a popular post would almost never be cached. The feed page is deleted on your own actions but not on other people's posts. State that tradeoff in the doc: deleting every follower's feed key on every post would double the fan-out work, so others' new posts may take up to 30 seconds to appear.

Check it: every key you'll write is in the table, each rule in one sentence.

### Step 2: Configure the cache Redis

Set `maxmemory` (a few hundred MB is plenty locally) and `maxmemory-policy allkeys-lru` on `redis-cache` through its command or a config file in Docker Compose. Confirm the queue Redis still says `noeviction`.

```bash
redis-cli -p 6380 CONFIG GET maxmemory-policy   # cache:  allkeys-lru
redis-cli -p 6379 CONFIG GET maxmemory-policy   # queue:  noeviction
```

Use whichever host ports you mapped in Docker Compose. Here the cache is on 6380.

Check it: both commands print the policy you expect.

### Step 3: Write one small cache helper

Write one helper in the API with three functions: get a key, get many keys at once, and set a key with a TTL. Each takes a key family name (`user`, `post`, `feed`) for counting. Serialise values as JSON, and remember that dates come back as strings. Add a little random jitter to every TTL, say up to 10%, so keys written in the same second don't all expire together.

Build keys in one place (`keys.user(id)`): a typo at a call site is a cache that silently never hits.

Check it: a unit test sets a key, reads it, waits past a short TTL and sees a miss.

### Step 4: Cache the reads, then invalidate on writes

Apply cache-aside to the profile endpoint, post hydration, counts and the first feed page. For hydration, use `MGET` on all the `post:{id}` keys in a page, query Postgres only for the misses (`WHERE id = ANY($1)`), and write those back. A page of 20 posts then costs at most one Redis call and one SQL query.

Then go through every write path and add the deletes from your table: profile edit, post edit and delete, the media worker's status flip, follow and unfollow. Delete **after** the database commit. Delete before it, and a concurrent read can refill the cache with the old value.

Check it: edit your bio and reload. The new bio shows immediately. Then like a post from another account and reload: the count may lag by up to 30 seconds, exactly as your table says.

### Step 5: Protect the hottest keys from a stampede

`popular_1`'s profile is read constantly. When `user:{popular_1}` expires, every request that misses at once queries Postgres. Add a single-flight guard on misses: take a short lock with `SET lock:{key} 1 NX PX 2000`. Only the request that gets the lock reads the database and refills the key. The others wait briefly and retry the cache.

Check it: with `k6` or a quick loop of 200 parallel `curl` calls right after deleting the key, the query log shows one profile query, not 200.

### Step 6: Count hits and misses

Increment an in-process counter for every lookup, labelled by family and outcome. Log a summary line every 30 seconds (`{"msg":"cache","family":"post","hits":912,"misses":64}`). The [observability milestone](/development/capstone/observability) turns these into Prometheus metrics. For a second opinion, `INFO stats` on the cache Redis reports `keyspace_hits` and `keyspace_misses` for the whole server.

Check it: browse the app for a few minutes and work out the hit rate per family. Write the numbers in your doc as a first baseline.

### Step 7: Record what you'd do differently at scale

Add a short paragraph under the table. Cover what happens if the cache Redis goes down: the app should fall back to Postgres, slower but correct, so wrap every cache call to treat errors as misses. Cover which key you'd stop caching if the hit rate turned out low. And cover the known race: a slow read can refill a key just after a write deleted it, which is why every key also has a TTL.

Check it: stop `redis-cache`. Pages still load, slowly, with no 500s.

## Common mistakes

- **Caching first, rules later.** Symptom: "my edit didn't show up" bugs that fix themselves. Fix: no key without a row in the table.
- **Caching counts inside the object.** Symptom: popular posts and profiles have the lowest hit rate in the app, because every like or follow deletes them. Fix: split hot-changing fields into their own short-TTL keys.
- **Deleting before the commit.** Symptom: rare stale values lasting until the TTL. Fix: delete after commit.
- **One Redis for cache and queue.** Symptom: with `allkeys-lru`, jobs vanish under memory pressure. With `noeviction`, cache writes start failing when memory fills. Fix: two instances, two policies.

## Say it in the interview

"Before caching anything, I wrote an invalidation table: every key, its TTL and exactly what deletes it. I split counts out of profiles and posts because they change far more often, and a like shouldn't evict a whole post. I chose to let the first feed page be up to 30 seconds stale for other people's posts, instead of deleting every follower's key on every post, which would have doubled fan-out writes. Every key also has a TTL as a backstop against races. Under load the hit rate for post hydration was X%, which I measured from per-family hit and miss counters."

## Stretch goals

- Replace the TTL-only rule for counts with write-through `HINCRBY` on a Redis hash, flushed to Postgres by a worker job. Write the new tradeoff in the doc.
