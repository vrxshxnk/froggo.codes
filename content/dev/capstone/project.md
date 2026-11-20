---
id: capstone
name: Ripple
tagline: A social platform built, measured and defended like a real system
summary: >-
  Build a small social network with media uploads, a hybrid fan-out feed, Redis caching, queues, rate limits and observability, then load test it and write up what broke. It's a system-design interview answer that actually runs.
time: About 4 weeks, 90-120 hours
---

## What you're building

Ripple is a small social network. You sign up, follow people, and post short text with photos. Your home feed shows posts from everyone you follow, newest first. Someone likes your post and a few seconds later you see "Ana and 12 others liked your post." You can search for people and posts. Upload a photo and the post shows "processing" for a moment, then the resized image appears.

The screen is the easy half. Underneath, slow work runs on a background worker, the feed uses a fan-out strategy you chose on paper and proved under load, every cache key has a written invalidation rule, and every mutation is safe to retry. You finish with a design doc, a load-test report with before and after numbers, and a case study.

## Features

- A written design doc: requirements, assumed scale, data model, API surface, diagram and the fan-out choice
- A monorepo with `web`, `api` and `worker` apps, shared types and validation, and CI on every pull request
- Sign-up, sessions, profiles and a follow graph with cached follower counts
- Photo uploads straight to object storage, processed by a worker, with a visible `processing` state
- A home feed that pulls at read time, plus push to follower timelines for accounts under a threshold
- Redis caching for feed pages, profiles and counts, with a written invalidation rule per key and a measured hit rate
- Aggregated notifications built by a worker from queued events
- Sliding-window rate limits per user, and `Idempotency-Key` support on every mutation
- Search across users and posts with Postgres full-text search
- JSON logs with one request ID across API, queue and worker, and a four-number dashboard
- A k6 load-test report and a public case study with a demo video

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| Monorepo | pnpm workspaces + Turborepo | One install and one cached test run for five packages. |
| Language | TypeScript everywhere | The job payloads the API sends the worker become a compile-time contract. |
| `web` | Next.js (App Router) | You know it already, and it only renders and calls the API. A Vite + React SPA is fine too. |
| `api` | Node.js with Express 5 | Thin, familiar and well documented. Fastify is the common alternative, and the milestones are the same. |
| `worker` | A plain Node.js process running BullMQ workers | Slow work lives here, and it deploys and scales separately from the API. |
| Database | Postgres with Drizzle ORM | Close to SQL, so you can explain the queries you wrote. Prisma is fine too. |
| Cache, rate limits, timelines | Redis | Sorted sets, TTLs and atomic scripts cover every hot-path need here. |
| Queue | BullMQ (on Redis) | Retries, backoff, delayed jobs and queue metrics, with no new infrastructure. |
| Object storage | An S3-compatible bucket (Cloudflare R2 or AWS S3) with presigned URLs | Upload bytes never pass through your API. |
| Images | `sharp` in the worker | Fast resizing and format conversion. Add `ffmpeg` only if you take on video. |
| Validation | Zod in `packages/validation` | One schema validates requests in the API and forms in `web`. |
| Observability | pino JSON logs, `prom-client` metrics, Prometheus and Grafana | All of it runs locally in Docker Compose. |
| Load testing | k6 | Scenarios, thresholds and p95 numbers come built in. |
| Local infra and CI | Docker Compose, GitHub Actions | One command starts everything, and CI uses the same images. |

Hosting is optional: one small VPS running the same Compose file is simplest, and Railway or Render also work. Check current pricing first.

## How it fits together

```text
 browser (web) ──presigned PUT──────────────► object storage
     │                                             ▲
     │ HTTPS + session cookie                      │ read original,
     ▼                                             │ write variants
  ┌──────┐  SQL   ┌──────────┐         ┌────────┐  │
  │ api  │──────► │ Postgres │ ◄───────│ worker │──┘
  │      │        └──────────┘   SQL   │        │
  │      │  cache, rate limits,        │        │
  │      │──────► Redis (cache) ◄──────│        │ timelines
  │      │  enqueue        ┌──────────────┐     │
  │      │───────────────► │ Redis (queue)│ ───►│ dequeue
  └──────┘                 └──────────────┘     └────────┘
     │ /metrics                                 │ /metrics
     └──────────────► Prometheus ─► Grafana ◄───┘
```

Follow one photo post. The API hands the browser a presigned URL, valid for a few minutes, and the browser uploads the file straight to the bucket. Then it calls `POST /posts` with an `Idempotency-Key` header. The API checks the rate limit, inserts the post as `processing`, enqueues a `process-media` job carrying the request ID, and responds within milliseconds. The worker resizes the photo, writes the variants to the bucket, flips the post to `ready` and enqueues a `fanout` job. That job pushes the post id into each follower's Redis timeline, unless the author is above the follower threshold. A follower's feed reads that timeline and merges in recent posts from the popular accounts they follow. Every log line on the way carries the same request ID.

## Out of scope

- **Kubernetes, microservices or sharding.** Three processes and two datastores show every idea here. More only adds deploy work.
- **Elasticsearch, Kafka or a cache cluster.** Postgres search, BullMQ and Redis cover this scale. The skill is saying when you'd add each.
- **Direct messages, stories or video calls.** They're other products. Huddle already covered real-time messaging.
- **A mobile app.** A clean, responsive web client is enough. The work that counts is behind the API.
- **A recommendation algorithm.** A reverse-chronological feed with one ranking tweak in search is plenty. Ranking is a whole field of its own.

## How to work through it

1. **Design and foundations** ([design doc](/development/capstone/design-doc), [monorepo and CI](/development/capstone/monorepo-ci), [auth and the follow graph](/development/capstone/auth-profiles)): about 20-25 hours. Most of the decisions get made here.
2. **The core system** ([media pipeline](/development/capstone/media-pipeline), [feed fan-out](/development/capstone/feed-fanout), [Redis caching](/development/capstone/redis-caching), [notifications](/development/capstone/notifications-queue)): about 35-45 hours. The feed alone can take a long weekend.
3. **Hardening** ([rate limits and idempotency](/development/capstone/rate-limit-idempotency), [search](/development/capstone/search-service), [observability](/development/capstone/observability)): about 20-25 hours.
4. **Proof** ([load test](/development/capstone/load-test-scaling), [case study](/development/capstone/ship-case-study)): about 15-20 hours. Don't squeeze it: the resume bullets come from here.

The rule that matters most: **the request path does only what must happen before you can respond, and everything else becomes a job.** Before adding work to a handler, ask whether the user must wait for it. If not, enqueue it.

## Show it off

Your README should include:

- The architecture diagram, plus one paragraph that walks a photo post end to end
- The fan-out decision with its threshold, and the load-test numbers that justified it
- The invalidation table: every cache key, its TTL and what evicts it
- The four-number dashboard as a screenshot taken during a load test
- A link to the design doc and its "what actually happened" section
- One command to run the whole stack locally (`docker compose up` plus `pnpm dev`)

In your demo, post a photo, show it go from `processing` to `ready`, then find its request ID in both the API and worker logs.

Resume bullets to adapt (use your own measured numbers):

- "Designed and built a social platform with a hybrid push/pull feed. Under a k6 popular-user scenario, it held p95 feed latency at X ms with Y concurrent users, compared with Z ms for pure push"
- "Moved media processing and notification aggregation onto BullMQ workers, cutting p95 create-post latency from X ms to Y ms. Raised the Redis cache hit rate to Z% under load, with a written invalidation rule for every key"
