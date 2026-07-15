---
title: "Project 6: Ripple — Building a System-Design Answer That Actually Runs"
excerpt: "The full build guide for the FAANG-level capstone of our Development Roadmap. Fan-out strategies, Redis invalidation, queues, idempotency keys, observability — and the writeup that gets you the interview."
date: "2026-07-14"
author: "Froggo"
tags: ["projects", "roadmap", "system-design", "architecture", "career"]
featured: true
---

There's a strange gap in how this industry hires. System-design interviews decide senior-track offers, yet almost everyone prepares for them the same way: watching videos of other people drawing boxes. Candidates learn to *say* "we'd use a hybrid fan-out strategy" without ever having watched a push-model feed melt under a popular account, because they've never run one.

Ripple — [Project 6, the capstone of the Development Roadmap](/development) — closes that gap by brute force. It's a scalable social platform: media uploads with background processing, a feed with an explicit fan-out strategy, Redis caching, queues, rate limiting, and observability. Twelve milestones over four weeks. When it's done, your system-design answers stop being recitations and become anecdotes. Interviewers can tell the difference in about ninety seconds.

## Deliverable #1 is a document, and that's not a warm-up

The first milestone is a design doc — requirements, assumed scale, data model, API surface, architecture diagram, and your fan-out choice with reasoning — written *before any code*. Resist the urge to treat this as ceremony to rush through. Two reasons.

First, the doc forces the decisions that hurt to reverse later. "Assume 10k users and a 100:1 read/write ratio" sounds like made-up numbers, and it is — but committing to made-up numbers is what turns "make it scalable" (unanswerable) into "make reads cheap because they outnumber writes a hundred to one" (an actual design constraint that decides your caching and fan-out strategy).

Second: a system-design interview *is a design doc, performed live, under time pressure*. Every hour spent writing this document is direct rehearsal. The roadmap says interviews are 50% this; if anything that's conservative for senior loops.

You'll update this doc at the end with what actually happened (milestone 12) — and the delta between planned and actual is the most honest engineering artifact you'll ever produce.

## The monorepo earns its keep at the async boundary

Milestone 2: three apps — `web`, `api`, `worker` — plus shared packages for types and validation, with CI running lint, typecheck, and tests from the very first PR.

```filestructure
ripple/
├── apps/
│   ├── web/          ← the client
│   ├── api/          ← request path: fast, thin
│   └── worker/       ← background jobs: where slow work lives
├── packages/
│   ├── types/        ← shared contracts
│   └── validation/   ← shared schemas
└── .github/workflows ← CI from day one
```

The `worker` app is the architectural newcomer, and its presence announces this project's core theme: **the request path does only what must happen before you can respond; everything else becomes a job.** Thumbnails, notification aggregation, feed pushes — none of it belongs in the milliseconds between request and response.

Why shared packages matter here specifically: the API enqueues jobs the worker consumes, and that queue payload is a contract between two processes that deploy separately. With shared types, a contract change is a compile error. Without them, it's a runtime failure in the worker at 2am. And CI from day one isn't perfectionism — retrofitting CI onto a grown codebase is genuinely 10x the pain of starting with it, because every deferred lint rule and skipped test becomes a batch of debt someone must clear all at once.

## Never COUNT(*) on render, and other lessons of the follow graph

The follows table (milestone 3) is trivial — two indexed columns, `follower_id` and `followee_id`. The lesson is what happens around it.

Follower counts render on every profile view. Computing them live means a `COUNT(*)` over the follows table on your hottest read path, and that query's cost grows with exactly the accounts that get viewed most — popularity makes it worse, which is backwards. So: cache the counts (a column you maintain, or Redis), accept the small risk of drift, reconcile periodically. This is your first deliberate trade of *perfect consistency* for *predictable latency* — the trade that defines large-scale system design. It will not be your last this month.

## The feed: implement pull, then add push, and now you own the textbook answer

Milestone 5 is the intellectual centerpiece. "How would you design the feed?" is the most-asked system design question in existence, and the textbook answer — hybrid fan-out — is something you're about to *build* rather than memorize.

The two pure strategies, and why each fails alone:

- **Pull** (fan-out on read): compute the feed at request time by merging recent posts from everyone you follow. Writes are instant; nothing goes stale. But every feed load does work proportional to your follow count, and your busiest read path is your most expensive one.
- **Push** (fan-out on write): when someone posts, write it into a precomputed timeline for each follower. Reads are a cheap indexed fetch. But one post from an account with a million followers is a million writes — the celebrity problem, and it melts exactly when you can least afford it.

The hybrid: push for accounts under a follower threshold (bounded, cheap), pull for the few above it, merge at read time. Small write amplification where it's safe, expensive merges only for the handful of accounts that need them.

The roadmap's ordering — **implement pull first, add push after** — is itself a design lesson: pull is simpler and correct at small scale, and push is an optimization you layer on once you can measure what it buys. Optimizations added before measurement are guesses wearing hard hats. And in milestone 11, when your load test hammers a popular-user scenario, you'll *watch* the pure strategy degrade and the hybrid hold. That graph is worth a hundred YouTube explainers.

## Caching is easy; invalidation is a contract you write down

Milestone 6's hint contains the discipline that separates caching that works from caching that haunts: **write down the invalidation rule for every cache key before implementing it.** Feed pages, profiles, counts — each gets a sentence: what makes this key stale, and what evicts or expires it.

The reason for the ritual: adding a cache is a one-line decision with a built-in reward (latency drops immediately) and a deferred cost (staleness bugs arrive weeks later, intermittently, unreproducibly — "sometimes my new post doesn't show up"). The write-it-first rule forces you to pay the thinking cost when it's cheap. If you can't state a key's invalidation rule in one sentence, you don't understand that key well enough to cache it — which is precisely the thing worth discovering *before* it's in production.

Log hits and misses while you're at it. "Redis at a 94% hit rate under load" is a sentence with numbers in it, and numbers are what make your final writeup credible.

## Queues, and the art of keeping slow things off the request path

Two milestones apply the same principle to different domains. The media pipeline (milestone 4): clients upload straight to object storage via presigned URL — bytes never transit your API, a pattern you know from Inkwell — then a worker generates thumbnails and transcodes while the post sits in a visible "processing" state until the job flips it. That user-facing async state machine (pending → processing → ready → failed) is the async lesson made visible; every video platform you've ever used works this way.

Notifications (milestone 7): likes, follows, and replies enqueue events; a worker *aggregates* — "Ana and 12 others liked your post" — and writes notification rows. Aggregation lives in the worker because it's exactly the kind of read-several-rows-and-collapse work that has no business inside a like's request path. A like should be: insert row, enqueue event, respond. Total work measured in single-digit milliseconds; everything else is someone else's problem — specifically, the worker's, a few hundred milliseconds later, where nobody is waiting.

## Idempotency keys: the pattern you already know, generalized

Milestone 8 brings back your webhook lesson from Lilypad Market and makes it universal. Any client can retry any mutation — flaky networks and impatient thumbs guarantee it — so every mutation endpoint accepts an `Idempotency-Key` header; the server caches the first response under that key and replays it for duplicates. A retried "create post" returns the same post instead of creating a twin.

Alongside it: sliding-window rate limits in Redis, per user per endpoint class — reads generous, writes tight. Ripple is where you have the infrastructure for this to be a real distributed rate limiter rather than the in-memory version from Huddle. Together these two give your API the property that makes operating it sane: **clients can retry anything, safely, forever.** APIs with that property shrug off network chaos; APIs without it corrupt data every time the Wi-Fi hiccups.

Milestone 9 — search with Postgres full-text and a GIN index, deliberately *not* Elasticsearch — plants a flag worth defending in the README: matching tool weight to actual scale is a senior signal, and "I didn't need it yet, here's the boundary where I would" is a better interview answer than any amount of resume-driven architecture.

## Observability: one request ID, across the async gap

Milestone 10 is the graduation exercise, and it's harder than it sounds: structured JSON logs carrying a request ID that survives the trip from API through queue to worker — so when a thumbnail job fails, you can trace it back to the exact upload request that spawned it, across process boundaries, minutes apart.

This is the capability that separates systems you can operate from systems you can only restart. Grepping one ID and seeing a request's whole life — API, enqueue, dequeue, worker, failure — turns debugging distributed systems from archaeology into reading. The mechanical trick is just discipline (generate the ID at the edge, put it in the job payload, include it in every log line), but you have to design for it; it cannot be retrofitted onto logs you didn't structure.

Then dashboard exactly four numbers: p95 latency, error rate, queue depth, cache hit rate. Not forty — four. Queue depth is the underrated one: it's the earliest warning you get that the system is falling behind, visible minutes before users feel anything. Four numbers you actually look at beat forty you don't, and knowing *which* four is itself the skill.

## The load test is where the project becomes a story

Milestone 11: k6 scenarios for browse-heavy traffic, post-heavy traffic, and the one you built the hybrid for — a popular-user pile-on. Find the first bottleneck. Fix it. Re-run. Record before and after.

That loop — measure, fix, measure — is performance engineering in its entirety, and the numbers it produces transform your resume line from adjective to evidence. "Built a scalable social platform" is a claim anyone can type. **"Feed held p95 under 180ms at 500 concurrent users after moving fan-out to a hybrid push/pull model"** is a measurement, with a decision inside it, that only someone who did the work can produce. Interviewers are drowning in the first sentence and starving for the second.

## Ship the writeup — it does a different job than the build

The final milestone: a 3-minute demo video, the design doc updated with what actually happened, and a README with the architecture diagram and load-test numbers, posted publicly.

The roadmap's phrasing is exact: *the writeup gets you the interview; the build gets you through it.* No hiring manager will clone your repo — but they will read a case study that walks from requirements to architecture to bottleneck to numbers, because it does the interviewer's job for them: it demonstrates, in advance, that you can explain a system you built. The demo video answers "is it real?", the diagram answers "did they design it?", the numbers answer "did they verify it?" — the three questions every technical screen is secretly asking.

## What this project proves

Everything, is the honest answer. You designed for scale on paper, made explicit tradeoffs, built the request path thin and pushed slow work behind queues, cached with written invalidation rules, made every mutation retry-safe, traced requests across async boundaries, and then measured the whole thing under load and wrote down what you found. That's not a student project. That's the job — at small scale, which is where everyone credible started.

---

**Ready for it?** All twelve milestones with hints are on the [Development Roadmap](/development) — free, sign in to track your progress. If you're not ready for the capstone yet, the ladder starts at [Project 1](/blog/developer-portfolio-project-guide) and each rung is built to get you here. And if you're grinding interviews in parallel, the [90-Day DSA Roadmap](/dsa) is the other half of the preparation.
