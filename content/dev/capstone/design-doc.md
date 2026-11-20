---
id: design-doc
project: capstone
title: Write the system design doc first
summary: >-
  Before any code, write the document a system-design interview asks you to produce live: requirements, assumed scale, data model, API surface, a diagram and your fan-out choice. Every later milestone reads from it.
time: 6-8 hours
doneWhen:
  - "`docs/design.md` exists in the repo and has all eight sections listed in this guide"
  - Your scale assumptions are written as numbers, including users, daily actives and a read/write ratio, with the arithmetic shown
  - Every table in the data model lists its primary key and the indexes your hottest queries need
  - The API surface lists every endpoint with its method, path and whether it's a read or a write
  - The diagram shows web, api, worker, Postgres, Redis, the queue and object storage, with arrows labelled
  - The fan-out section names push, pull or hybrid, gives a follower threshold, and says why in under 150 words
docs:
  - label: "GitHub Docs: Creating diagrams (Mermaid in Markdown)"
    url: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams
  - label: Excalidraw
    url: https://excalidraw.com/
  - label: "PostgreSQL: Multicolumn indexes"
    url: https://www.postgresql.org/docs/current/indexes-multicolumn.html
  - label: "Redis: Sorted sets"
    url: https://redis.io/docs/latest/develop/data-types/sorted-sets/
---

## What you're building

A Markdown file, `docs/design.md`, in an otherwise empty repo. It answers what an interviewer asks in the first 20 minutes of a system-design round: what are we building, for how many people, what's stored and how it's read, what the API looks like, which boxes talk to which, and how the feed works.

By the end you'll have numbers on paper that drive real decisions in later milestones. The fan-out threshold, the timeline length and the cache TTLs all trace back to this page.

## Why it matters

A system-design interview is this document performed out loud under time pressure, so writing it slowly, with real arithmetic, is the best rehearsal you can get. It also changes how you build. "Make it scalable" can't be acted on. "Reads outnumber writes 100 to 1, so a feed load must be cheap even when a post is expensive" decides your caching and fan-out strategy for you.

## Before you start

- **Functional and non-functional requirements.** Functional ones say what the product does ("a user can follow another user"). Non-functional ones say how well it must do it ("a feed page loads in under 200 ms at p95"). Interviewers care more about the second list.
- **p95 latency.** Sort every request's duration. The p95 is the value that 95% of requests come in under. Averages hide the slow tail that users actually notice, which is why you set targets in percentiles.
- **Read/write ratio.** Reads per write. Social apps are read-heavy, which pushes work to write time so reads stay cheap.
- **Fan-out.** Getting one post in front of all of an author's followers. **Pull** (fan-out on read) gathers posts from everyone you follow when you open the feed. **Push** (fan-out on write) copies the post's id into every follower's timeline when it's created. The [feed milestone](/development/capstone/feed-fanout) builds both.
- **Back-of-envelope estimates.** Rough multiplication to check whether something is 10 requests a second or 10,000.

## Build it step by step

### Step 1: Write requirements and non-goals

Create the repo and `docs/design.md`. Start with three lists. **Functional:** sign up, follow, post text with up to four photos, a home feed, like, reply, notifications and search. **Non-functional:** latency targets for the feed and for creating a post, what "available" means to you, and how stale a follower count may be (say, a minute). **Non-goals:** direct messages, video, ranking algorithms and multi-region. Non-goals belong in the doc because they explain gaps an interviewer would otherwise ask about.

Check it: every functional requirement maps to an endpoint in step 4.

### Step 2: Commit to a scale and do the arithmetic

Pick numbers and show your working. Here is an example. Use your own.

```text
users                10,000      daily active   2,000 (20%)
feed loads / DAU     20/day      -> 40,000 reads/day
posts / DAU          0.2/day     -> 400 writes/day     (ratio 100:1)
average rate         40,000 / 86,400 s  ≈ 0.5 reads/s
peak (assume 10x)    ≈ 5 reads/s
follows per user     median ~50, but skewed: a few accounts have 3,000+
push cost per post   followers × 1 timeline write
  median author      ~50 writes        popular author   3,000+ writes
```

Be honest about what this shows: at this scale one Postgres server could serve a pull feed. Say you'll design for 10x headroom and that the [load test](/development/capstone/load-test-scaling) will push well past these numbers. The skew in the follow graph is the number that matters, because it's why pure push fails.

Check it: you can say out loud, in one breath, how many timeline writes your most-followed seeded user causes per post.

### Step 3: Sketch the data model

List each table with its columns, primary key and indexes. Write the access pattern next to each index, because an index only exists to serve a query.

```text
users          id, username (unique), display_name, bio, avatar_key,
               followers_count, following_count, created_at
sessions       id (random token hash), user_id, expires_at
follows        PK (follower_id, followee_id)   + index (followee_id, follower_id)
posts          id, author_id, parent_id null, body, status, like_count,
               created_at   + index (author_id, created_at desc)
media          id, post_id, owner_id, storage_key, status, variants json
likes          PK (user_id, post_id)          + index (post_id)
notifications  id, recipient_id, type, target_id, actor_count, read_at
Redis          timeline:{userId}  sorted set of post ids, scored by time
```

Use time-sortable ids (UUIDv7 or a bigint sequence), so id order matches time order and cursors stay simple.

Check it: for "who do I follow?", "who follows me?" and "this author's recent posts", you can point to the index that answers each one.

### Step 4: List the API surface

Write one line per endpoint: method, path, read or write, and auth. For example `GET /feed?cursor=` (read, signed in) and `POST /posts` (write, takes `Idempotency-Key`). Note which endpoints use cursor pagination, and why: offsets get slower and skip rows as new posts arrive.

Check it: every write endpoint says it accepts `Idempotency-Key`, and every list endpoint takes a `cursor`.

### Step 5: Draw the architecture

Draw boxes for `web`, `api`, `worker`, Postgres, Redis (cache), Redis (queue) and the bucket. Label every arrow with what crosses it: "SQL", "enqueue process-media", "presigned PUT". Use Mermaid, which GitHub renders inside Markdown, or Excalidraw exported as an SVG. Then add a numbered walkthrough of one photo post. The diagram shows the structure, and the walkthrough proves it works.

Check it: a friend can trace a photo from browser to a follower's feed using only the diagram.

### Step 6: Make the fan-out decision and write down the tradeoff

This is the section interviewers probe hardest. Write it as a decision record. Give the options (push, pull, hybrid), the choice and the reason, with numbers. The textbook answer is the hybrid, and your step 2 numbers should show why. Pull alone makes every feed load do work proportional to how many people you follow. Push alone turns one post from a popular account into thousands of writes. The hybrid pushes for authors under a threshold, pulls for the few above it, and merges the two at read time.

State the threshold, for example 1,000 followers, and say you'll make it a config value so the load test can compare pure push, pure pull and hybrid. Write down the costs you're accepting: two read paths to keep correct, and timelines in Redis that you must be able to rebuild from Postgres.

Check it: the section answers "what happens when a 5,000-follower account posts?" in two sentences.

### Step 7: Add a risks and open questions section

List what you aren't sure of yet. How will you rebuild a lost timeline? What happens to queued jobs if the worker crashes? Should rate limiting fail open or fail closed if Redis is down? Leave them open. Later milestones close them, and the [final milestone](/development/capstone/ship-case-study) adds a "what actually happened" section, where you compare each guess with reality.

Check it: the doc has eight sections. They are requirements, scale, data model, API, architecture, fan-out, risks and an empty "what actually happened".

## Common mistakes

- **No numbers in the scale section.** Symptom: the doc says "highly scalable" but nothing in it decides anything. Fix: every claim gets a number, even an assumed one, with the multiplication shown.
- **Indexes without access patterns.** Symptom: you add indexes on every column, or miss the one the feed needs, and find out in the load test. Fix: write the query next to each index. A composite index helps queries that filter on its leading columns.
- **Designing for a scale you'll never test.** Symptom: sharding and multi-region sections you can't build or measure. Fix: design for 10x, plus one "beyond this, I would..." paragraph.
- **Treating the doc as finished.** Symptom: the code drifts and the doc is useless at the end. Fix: update it in the same pull request that changes a decision.

## Say it in the interview

"Before writing code I wrote a design doc with assumed numbers: 10,000 users, 2,000 daily actives and a 100:1 read/write ratio. The numbers showed a pull feed would be fine on average but expensive for heavy readers. The skewed follow graph showed pure push would explode for popular accounts. So I chose a hybrid with a 1,000-follower threshold and made it configurable. The tradeoff is two read paths to keep consistent, which I accepted because the load test later showed the hybrid held its latency where pure push didn't."

## Stretch goals

- Add a short "alternatives considered" note for the database and the queue. Say why Postgres and not a document store, and why BullMQ and not a managed queue.
