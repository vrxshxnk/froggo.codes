---
id: feed-fanout
project: capstone
title: Build the feed with an explicit fan-out strategy
summary: >-
  Build the home feed as a pull query first and measure it. Then add push fan-out into Redis timelines for authors under a follower threshold, and merge the two at read time. The threshold is a config value, so the load test can compare pure pull, pure push and the hybrid.
time: 10-14 hours
doneWhen:
  - The feed shows posts from everyone you follow, newest first, with cursor pagination that never repeats or skips a post as you scroll
  - A new post from a normal account appears in a follower's feed within a few seconds, read from their Redis timeline
  - A new post from an account above the threshold appears in followers' feeds without any fan-out job writing to their timelines
  - Deleting a follower's timeline key in Redis doesn't break their feed; the next load rebuilds it
  - Following someone puts their recent posts in your feed, and unfollowing removes them
  - Setting `FANOUT_THRESHOLD` to 0 gives pure pull, setting it very high gives pure push, and the feed looks the same in every mode
docs:
  - label: "Redis: Sorted sets"
    url: https://redis.io/docs/latest/develop/data-types/sorted-sets/
  - label: "Redis: ZADD"
    url: https://redis.io/docs/latest/commands/zadd/
  - label: "Redis: Pipelining"
    url: https://redis.io/docs/latest/develop/using-commands/pipelining/
  - label: "PostgreSQL: LIMIT and OFFSET"
    url: https://www.postgresql.org/docs/current/queries-limit.html
  - label: "PostgreSQL: Using EXPLAIN"
    url: https://www.postgresql.org/docs/current/using-explain.html
---

## What you're building

The home feed: posts from everyone you follow, newest first, 20 at a time. To the user it's a plain list. Underneath, posts from ordinary accounts are pushed into your timeline when published, posts from the few very popular accounts are pulled when you open the feed, and the two are merged.

You'll build pull first, because it's simple and always correct, then add push where it's cheap.

## Why it matters

"Design a news feed" is one of the most common system-design questions, and most candidates can only recite the hybrid answer. You'll have built it, watched where each pure strategy struggles, and set the threshold from your own measurements. That's a story with numbers, not a memorised answer.

## Before you start

- **Pull and push.** Pull joins your follows with posts at read time: free writes, reads that grow with your follow count. Push adds each new post's id to every follower's timeline: cheap reads, but one write per follower, which is huge for popular authors.
- **Redis sorted set.** Members kept in order of a numeric score. `ZADD timeline:42 <timestamp> <postId>` inserts, `ZRANGE ... BYSCORE REV LIMIT 0 20` reads the newest, and `ZREMRANGEBYRANK` trims to a fixed length.
- **Keyset (cursor) pagination.** The cursor is the `(created_at, id)` of the last post seen, and the next page is everything strictly older. The id breaks timestamp ties.

## Build it step by step

### Step 1: Build the pull feed

Add an index on `posts (author_id, created_at DESC, id DESC)`. Write `GET /feed?cursor=`, which selects ready, top-level posts whose author is someone you follow, or you. Filter to rows older than the cursor, order by `created_at DESC, id DESC`, and limit to 21: the extra row says whether there's a next page. Encode the cursor as opaque base64 of `{ createdAt, id }`.

```json
{ "items": [{ "id": "01J...", "author": { "username": "ana" }, "body": "...", "media": [], "likeCount": 3 }], "nextCursor": "eyJjIjoiMjAyNi0..." }
```

Check it: scroll five pages for one seeded user. No post id repeats, and timestamps never go up.

### Step 2: Measure pull before changing anything

Run `EXPLAIN ANALYZE` on the feed query for a seeded user following 30 accounts and one you set up to follow 2,000. Write both times and plan shapes in your design doc. Push is an optimisation, and you can't claim it helped without a "before".

Check it: you have two numbers written down, and you can explain from the plan why the heavy follower's query does more work.

### Step 3: Fan out on write

When the media worker flips a post to `ready` (or when a text post is created), enqueue a `fanout` job with `{ postId, authorId, createdAtMs, requestId }`. The fanout worker:

```text
author = load author
if author.followers_count >= FANOUT_THRESHOLD: return        # pulled at read time
add post to the author's own timeline
for each batch of 1,000 follower ids (keyset over the reverse follows index):
    pipeline: for each follower f
        ZADD timeline:{f} createdAtMs postId
        ZREMRANGEBYRANK timeline:{f} 0 -(TIMELINE_MAX + 1)   # keep newest TIMELINE_MAX
    exec pipeline
```

Only add to timelines that already exist (see common mistakes). A small Lua script that runs the `ZADD` and trim only if the key exists keeps check and write atomic. A missing timeline is rebuilt in full on that user's next read.

Pipeline each batch into one round trip. Cap timelines (500 is a fine start) to bound memory. Store them in the **cache** Redis: they're derived data, rebuildable from Postgres, so eviction is acceptable.

Also write `rebuildTimeline(userId)` now. It fills a timeline from the pull query, limited to authors under the threshold, plus the sentinel described in step 4. Step 4 calls it on a miss.

Check it: run `rebuildTimeline` for one follower, post as someone they follow, and run `ZRANGE timeline:<followerId> 0 0 REV WITHSCORES` in `redis-cli`. The new post id is on top. A follower with no timeline gets no key.

### Step 4: Read the hybrid feed

The feed endpoint now merges two sources:

```text
pushed  = up to 21 ids from timeline:{me} older than the cursor
if timeline:{me} was never built: rebuild it from the pull query,
        limited to authors under the threshold, then read again
celebs  = accounts I follow, plus me, with followers_count >= FANOUT_THRESHOLD
pulled  = up to 21 posts by celebs older than the cursor      # uses the step-1 index
merged  = pushed ∪ pulled, de-duplicated by id, sorted by (created_at, id) desc
page    = hydrate the first 20 in one query; drop any deleted or not-ready posts
```

The `celebs` list is small and rarely changes, so cache it per user. Pulling from a handful of authors is cheap.

Redis deletes an empty sorted set, so a missing key can't tell "never built" from "built but empty", and a user who follows only popular accounts would rebuild on every load. Add a sentinel member (say `_` with score 0) when building, and skip it when reading. It lives in the same key, so it can't be evicted separately.

Two posts in the same millisecond can hide one at a page boundary if you filter by score alone. Fetch a few extra ids and filter by the full `(created_at, id)` cursor in code.

Check it: follow one account above the threshold and several below, and post from each. All posts appear in order, and none of the popular account's are in your Redis timeline.

### Step 5: Keep timelines honest when the graph changes

Three events need a small job each:

- **Follow.** Your timeline lacks the new followee's old posts. Enqueue a backfill that adds their latest posts to your timeline (skip this for popular accounts, which are pulled anyway).
- **Unfollow.** Their posts linger in your timeline. Enqueue a job that removes their recent post ids with `ZREM`.
- **Delete a post.** Hydration already drops it, so a cleanup job is optional at this scale.

Check it: follow someone and refresh. Their last posts are there. Unfollow and refresh, and they're gone.

### Step 6: Make the strategy a config value

Read `FANOUT_THRESHOLD` and `TIMELINE_MAX` from the environment in both API and worker. A threshold of 0 gives pure pull, and a huge one gives pure push. The [load test](/development/capstone/load-test-scaling) runs each mode against the same scenario, which makes the comparison fair.

Check it: run the feed in all three modes for the same user. The list of post ids on page one is identical every time.

### Step 7: Write the decision into the design doc

Update the fan-out section with what you built and the step 2 numbers. Name the tradeoff: cheap reads for nearly everyone and bounded write cost per post, in exchange for two read paths, a merge, backfill and cleanup jobs, and eventually consistent timelines (a pushed post can take seconds to appear). Record the threshold and why, and leave a line for the load-test result.

Check it: someone reading only the doc could predict what happens, and how many Redis writes happen, when `popular_1` posts.

## Common mistakes

- **Offset pagination on the feed.** Symptom: scrolling shows the same post twice after someone posts, and deep pages get slow. Fix: keyset cursor on `(created_at, id)`.
- **Hydrating one post at a time.** Symptom: 21 queries per feed load. Fix: one `WHERE id = ANY($1)` query, re-ordered in code.
- **Pushing before the post is ready.** Symptom: followers see broken placeholders or posts that later fail. Fix: fan out only after status becomes `ready`.
- **Pushing into an evicted timeline.** Symptom: a user's feed suddenly shows only the last few posts. A `ZADD` created a fresh key holding one post, and the read path took it as built. Fix: fan out only to keys that exist.
- **Treating Redis as the source of truth.** Symptom: after a Redis restart, everyone's feed is empty. Fix: a missing timeline triggers a rebuild from the pull query. Postgres always has the truth.

## Say it in the interview

"I built pull first and measured it: a user following 2,000 accounts was noticeably slower than one following 30. Then I added push into capped Redis sorted sets for authors under 1,000 followers, and at read time merged that with a small pull from the popular accounts, hydrating in one query. The threshold is an environment variable, so I load-tested all three modes on the same data. The tradeoff is complexity: two read paths plus backfill and cleanup jobs. Timelines are derived data, so losing Redis means a rebuild, not data loss."

## Stretch goals

- Split fan-out for large audiences into child jobs of 1,000 followers each with `addBulk`, so one big post doesn't block the queue for everyone else.
