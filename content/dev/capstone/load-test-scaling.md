---
id: load-test-scaling
project: capstone
title: Load test and write the scaling report
summary: >-
  Write three k6 scenarios: browse-heavy, post-heavy and a popular-user pile-on. Run them against a production build, find the first bottleneck, fix it, run again, and record before and after numbers in a scaling report, including pure push vs hybrid fan-out.
time: 8-12 hours
doneWhen:
  - "`k6 run` works for all three scenarios against a production build, with thresholds on p95 latency and error rate"
  - The pile-on scenario has been run in pull, push and hybrid fan-out modes against the same seed data, and all three results are in a table
  - You've named the first bottleneck with evidence (a dashboard screenshot, a `pg_stat_statements` row or a queue-depth graph), not a guess
  - You fixed that bottleneck, re-ran the same scenario, and recorded before and after p95, error rate and throughput
  - "`docs/scaling-report.md` describes the setup (machine, data size, modes) so someone else could repeat the run"
docs:
  - label: "k6: Scenarios"
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/
  - label: "k6: Thresholds"
    url: https://grafana.com/docs/k6/latest/using-k6/thresholds/
  - label: "k6: Open and closed models"
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
  - label: "k6: SharedArray"
    url: https://grafana.com/docs/k6/latest/javascript-api/k6-data/sharedarray/
  - label: "PostgreSQL: pg_stat_statements"
    url: https://www.postgresql.org/docs/current/pgstatstatements.html
---

## What you're building

A `loadtest/` folder with three k6 scripts and a report. The scripts simulate people scrolling, people posting and liking, and the case you built the hybrid for: a popular account posting while thousands of followers refresh. The report says what you ran, what broke first, what you changed, and the numbers before and after. Its table becomes your resume bullets.

## Why it matters

Measure, find the bottleneck, fix, measure again: that loop is performance engineering. Many candidates can describe a hybrid feed, few can say "pure push hit p95 of X ms in the pile-on, the hybrid held at Y ms, here's the graph". The bottleneck is rarely where you expect, and finding it from evidence is what "how would you find out?" is testing.

## Before you start

- **Virtual users (VUs).** k6 runs your script in many parallel loops, each acting as a user. It's JavaScript in k6's own runtime, not Node, so most npm packages won't work.
- **Open vs closed model.** In a closed model (fixed VUs), a slow server slows the request rate too, which hides problems. In an open model (`constant-arrival-rate`), k6 starts new iterations at a fixed rate whatever the response time, the way real users arrive. Use open for most scenarios.
- **Thresholds.** Pass/fail rules on metrics, such as `http_req_duration: ["p(95)<200"]` and `http_req_failed: ["rate<0.01"]`. They turn a load test into a check you can repeat.
- **Bottleneck.** The one resource that limits throughput right now: the Postgres connection pool, one slow query, Node's event loop, worker concurrency, Redis round trips. Fixing anything else doesn't help until this one moves.
- **`pg_stat_statements`.** A Postgres extension that records total and mean time per query shape. Sorting by total time shows which query the database spends most of its life on.

## Build it step by step

### Step 1: Prepare a realistic, repeatable environment

Run production builds: `next build && next start`, and the API and worker compiled with `NODE_ENV=production`. Dev servers with file watching and source maps are far slower and give meaningless numbers. Load the 10,000-user seed. Make sure `popular_1` has thousands of followers, and that every user's timeline is either built or flushed the same way before each run. If you can, run k6 from a different machine than the system under test. If you can't, note it in the report, since k6 and your stack will compete for CPU.

Enable `pg_stat_statements` (add it to `shared_preload_libraries` in the Postgres container's command and run `CREATE EXTENSION`), so you can reset it before each run.

Check it: `SELECT pg_stat_statements_reset();` works, and the dashboard from the [observability milestone](/development/capstone/observability) is open and quiet.

### Step 2: Give k6 real users

Write a script that creates sessions for 2,000 seeded users and writes their tokens to `loadtest/users.json` (git-ignored). In k6, load that file once with `SharedArray` and give each iteration a user based on the VU number. Spreading traffic across many users matters. One user sending everything would trip your per-user rate limits and only ever exercise one timeline.

Check it: a one-VU smoke run (`k6 run --vus 1 --iterations 5 browse.js`) gets 200s, not 401s or 429s.

### Step 3: Write the three scenarios

Each script has an `options` object with scenarios and thresholds. The shape, for orientation:

```javascript
export const options = {
  scenarios: {
    browse: { executor: "constant-arrival-rate", rate: 200, timeUnit: "1s",
              duration: "5m", preAllocatedVUs: 300 },
  },
  thresholds: { http_req_duration: ["p(95)<200"], http_req_failed: ["rate<0.01"] },
};
```

Fill in the traffic mix yourself, with weighted random choices per iteration:

```text
browse-heavy   feed first page 60%, next page 15%, profile 15%, post 5%, search 5%
post-heavy     create text post 40% (fresh Idempotency-Key each), like 40%,
               follow/unfollow 10%, feed 10%
pile-on        writer: popular_1 creates a post every 3 s (under the write limit)
               readers: ramp to 500 VUs, all followers of popular_1, loading
               the feed every few seconds; 20% also open popular_1's profile
```

Tag requests by endpoint (`tags: { name: "feed" }`), so k6 reports latency per endpoint, not one blended number. Start from rates you can sustain and ramp up until a threshold fails. That breaking point is a result too.

Check it: each scenario runs to completion and prints per-tag p95 values.

### Step 4: Run the baseline and find the first bottleneck

Run each scenario once and save k6's summary (`--summary-export`) next to a dashboard screenshot. Then look for the limiting resource, in this order:

```text
error rate up?          read the error logs for that window first
p95 up, CPU low?        waiting on something: pg pool exhausted, Redis round trips,
                        lock contention; check pg_stat_activity for waiting queries
p95 up, API CPU high?   event loop: big JSON serialisation, sync work, N+1 loops
queue depth climbing?   worker concurrency or a slow job; check job_duration_seconds
one query dominating?   pg_stat_statements by total time, then EXPLAIN ANALYZE it
```

Usual suspects: a connection pool left at its small default, per-post hydration queries, a missing index, fan-out sharing a worker with media jobs. Don't assume: write down the evidence for yours.

Check it: you can name one bottleneck and point to the graph or row that proves it.

### Step 5: Fix one thing, then re-run the same scenario

Change one thing at a time: pool size, an index, batching a query, separate worker concurrency per queue, a cache key. Re-run with the same seed, the same rates and the same machine. Record the result even if it didn't help. "Raising the pool from 10 to 30 moved p95 by 3%, so the pool wasn't it" is a useful finding. Repeat until you've moved the first bottleneck and can see the next one.

Check it: your report has at least one row where p95 or throughput clearly improved, and the change that caused it is named.

### Step 6: Compare fan-out strategies under the pile-on

Run the pile-on three times, with `FANOUT_THRESHOLD=0` (pure pull), a very large threshold (pure push) and your chosen hybrid. Reset timelines and `pg_stat_statements` between runs. For each, record feed p95, create-post p95, queue depth peak, and how long a `popular_1` post took to reach a follower's feed. Pure push should show a large fan-out job and a delay for followers, while pure pull should show heavier feed queries. Report whatever you actually observe, even if it surprises you, and explain it.

Check it: a table with three rows, one per mode, and a sentence under it saying which mode you'd ship and why.

### Step 7: Write the scaling report and update the design doc

Write `docs/scaling-report.md` with these sections: setup (machine, data size, build), scenarios (rates and mix), results table, bottlenecks found and fixes applied in order, and the fan-out comparison. End with the next bottleneck you'd expect and what you'd do about it. Copy the headline numbers into the design doc's "what actually happened" section. That includes the tradeoff the numbers confirmed or overturned, such as whether the threshold you chose on paper survived.

```text
| scenario | change           | rps | p95 feed | p95 create | errors | queue peak |
| browse   | baseline         |     |          |            |        |            |
| browse   | pool 10 -> 30    |     |          |            |        |            |
```

Check it: someone else could repeat your run from the report alone.

## Common mistakes

- **Load testing the dev server.** Symptom: p95 in the seconds at low load, and every change looks like noise. Fix: production builds of all three apps.
- **One test user.** Symptom: everything 429s, or the results only reflect one cached timeline. Fix: thousands of seeded sessions loaded with `SharedArray`.
- **Changing several things between runs.** Symptom: p95 improved and you can't say why. Fix: one change per run, logged in the table.
- **Closed-model tests only.** Symptom: latency looks stable because the request rate quietly fell as the server slowed. Fix: use `constant-arrival-rate` and compare the achieved rate with the target.
- **Forgetting the async side.** Symptom: API latency looks great, while the queue grows without bound and notifications arrive minutes late. Fix: record queue depth and fan-out delay alongside p95.

## Say it in the interview

"I wrote three k6 scenarios with open-model arrival rates and seeded sessions across 2,000 users. The first bottleneck was X. I found it from Y, fixed it with Z, and p95 on the feed went from A ms to B ms at the same rate. Then I ran the pile-on in all three fan-out modes. Pure push delayed a popular account's post reaching followers by about C seconds and spiked queue depth, while the hybrid held feed p95 at D ms. The tradeoff I'd point out is that the hybrid's feed query costs a little more for users who follow many popular accounts, and my numbers say that's worth it."

## Stretch goals

- Run the stack on a small cloud VM and the load generator on another, and compare the numbers with your laptop run. Explain the difference.
