---
id: observability
project: capstone
title: "Observability: structured logs, metrics, tracing"
summary: >-
  Give every request an ID, carry it through the queue into the worker, and log JSON lines everywhere, so you can follow one upload across processes. Then put exactly four numbers on a dashboard: p95 latency, error rate, queue depth and cache hit rate.
time: 8-10 hours
doneWhen:
  - Every API response has an `X-Request-Id` header, and every log line from that request carries the same `requestId`
  - Searching your logs for one upload's request ID shows its API lines and its worker lines, in order, from different processes
  - "`/metrics` on the API and on the worker returns Prometheus text, and Prometheus shows both targets as up"
  - A Grafana dashboard shows p95 latency, error rate, queue depth and cache hit rate, and all four move when you generate traffic
  - Stopping the worker makes the queue-depth panel climb within a minute
  - No log line contains a password, a session token or a full presigned URL
docs:
  - label: "Node.js: Asynchronous context tracking (AsyncLocalStorage)"
    url: https://nodejs.org/api/async_context.html
  - label: "pino-http (GitHub)"
    url: https://github.com/pinojs/pino-http
  - label: "prom-client (GitHub)"
    url: https://github.com/siimon/prom-client
  - label: "Grafana: Prometheus data source"
    url: https://grafana.com/docs/grafana/latest/datasources/prometheus/
  - label: "BullMQ: Metrics"
    url: https://docs.bullmq.io/guide/metrics
---

## What you're building

Two things you can show on screen. First, a log search: paste one request ID and see the API receive an upload and enqueue `process-media`, then the worker, in another process, resize it and flip the post to `ready` or fail with a reason.

Second, a Grafana dashboard with exactly four panels: p95 latency, error rate, queue depth and cache hit rate. You'll watch it during the load test.

## Why it matters

A system you can't see into can only be restarted, not debugged. Ripple's hard part is the async boundary: a failed thumbnail job errors in another process, minutes after the request that caused it. An ID that crosses the boundary turns guesswork into reading. Choosing four numbers is also a skill. Each answers a real question: are users waiting, getting errors, is the background falling behind, is the cache working?

## Before you start

- **Structured logs.** One JSON object per line with fixed fields (`level`, `msg`, `requestId`, `durationMs`), so tools can filter by field. Pino writes this format and is fast enough to leave on.
- **Correlation ID.** An id generated at the edge (or accepted from an incoming `X-Request-Id` header), returned to the client, and attached to every log line and every job the request creates. This is the core of tracing, and it works without any tracing library.
- **AsyncLocalStorage.** Node's built-in way to keep per-request context across `await`s without passing it through every function. Store the request's logger once, and any code can fetch it.
- **Prometheus metrics.** Each process exposes `/metrics` as text, and Prometheus scrapes it. A *counter* only goes up (requests, hits), a *gauge* moves both ways (queue depth), and a *histogram* buckets observations, which gives you p95.
- **Label cardinality.** Every unique combination of label values is a separate time series. Label by route *template* (`/posts/:id`), never the raw URL (`/posts/01J9...`), or you create a series per post and your metrics store falls over.

## Build it step by step

### Step 1: Request IDs and JSON logs in the API

Add `pino-http` as the first middleware. Configure its request ID generator to reuse a valid incoming `X-Request-Id` or create one with `crypto.randomUUID()`, and set the same value on the response header. Put the request-scoped child logger into an `AsyncLocalStorage` store, so services and database helpers can log with the ID without changing their signatures. Configure pino's `redact` option for `req.headers.cookie`, `req.headers.authorization` and any field named `password`.

```json
{"level":30,"time":1763635200000,"requestId":"a3f1c2...","route":"POST /posts","status":201,"durationMs":38,"userId":"01J...","msg":"request completed"}
```

Check it: `curl -i localhost:4000/feed` shows an `X-Request-Id` header, and the matching log line has the same id.

### Step 2: Carry the ID across the queue

Every job payload already has a `requestId` field from the [monorepo milestone](/development/capstone/monorepo-ci), so now fill it. Every producer sets it from the current request's context. In the worker, wrap each job handler so it creates a child logger with `{ requestId, jobId, queue, attempt }` and runs the handler inside an `AsyncLocalStorage` scope. Jobs that spawn jobs (the media worker enqueueing `fanout`) pass the same `requestId` on, so one upload's whole chain shares one ID.

Check it: upload a photo, take the request ID from the response header, and filter the logs from both processes by it (`docker compose logs api worker | grep <id>`, or `jq` on the files). You should see the API lines, then the `process-media` lines, then the `fanout` lines.

### Step 3: Log the events that matter, at the right level

Use `info` for state changes (job done with duration, status changed), `warn` for retries and fallbacks (cache error as miss, limiter failed open) and `error` for final failures with the stack. Leave cache lookups to counters. Never log full presigned URLs: the signature is a live credential until it expires.

Check it: force a media job to fail. You get one `warn` per retry and one `error` at the end, all with the same `requestId`.

### Step 4: Expose metrics from both processes

Use `prom-client` in the API and the worker, each with its own `/metrics` endpoint (the worker needs a tiny HTTP server just for this). Define:

```text
http_request_duration_seconds   histogram   labels: method, route, status_class
http_requests_total             counter     labels: method, route, status_class
cache_lookups_total             counter     labels: family, outcome (hit|miss)
queue_jobs                      gauge       labels: queue, state (waiting|active|delayed|failed)
job_duration_seconds            histogram   labels: queue, outcome
```

Set the queue gauge on a timer, every 5-10 seconds, from `queue.getJobCounts(...)` for each queue. Pick histogram buckets around your targets (for example 10 ms to 2 s), so p95 lands between buckets you can resolve. Replace the in-process cache counters from the caching milestone with `cache_lookups_total`.

Check it: `curl localhost:4000/metrics | grep http_request_duration` shows bucket lines for the routes you've called, and the route label reads `/posts/:id`, not a real id.

### Step 5: Run Prometheus and Grafana locally

Add `prometheus` and `grafana` to Docker Compose, with a small Prometheus config scraping the API and worker (apps on the host are usually reachable at `host.docker.internal`). Add Prometheus as a Grafana data source through provisioning files, so it survives a reset.

Check it: Prometheus's Targets page lists both jobs as `UP`.

### Step 6: Build the four-panel dashboard

One panel per question, each a single query:

```text
p95 latency     histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))
error rate      sum(rate(http_requests_total{status_class="5xx"}[1m])) / sum(rate(http_requests_total[1m]))
queue depth     sum by (queue) (queue_jobs{state="waiting"})
cache hit rate  sum(rate(cache_lookups_total{outcome="hit"}[5m])) / sum(rate(cache_lookups_total[5m]))
```

Export the dashboard JSON into the repo (`infra/grafana/`), so anyone who clones it gets the same screen.

Check it: run a quick burst of feed requests. p95 and hit rate move. Stop the worker and post a few photos, and queue depth climbs. Restart it and the depth drains back to zero.

### Step 7: Record the decisions

In your design doc, add an "Operability" section. Say why these four numbers, and which one warns first. Queue depth usually climbs before users notice anything. State the tradeoff of request-ID correlation over full distributed tracing with OpenTelemetry. Correlation is simple, has no extra infrastructure, and covers the async gap. In exchange you don't get automatic per-span timings across services. Say when you'd adopt OpenTelemetry: when more services, or slow calls inside a request, make "which step was slow?" hard to answer from logs.

Check it: the section names one alert you'd set on each number, with a threshold.

## Common mistakes

- **Generating a new ID in the worker.** Symptom: worker logs have IDs that match nothing in the API logs. Fix: read `requestId` from the job data and only generate one if it's missing.
- **Raw URLs as metric labels.** Symptom: `/metrics` grows to megabytes, and Prometheus slows to a crawl. Fix: label with the matched route template, and the status *class* (2xx, 4xx, 5xx).
- **Averages instead of percentiles.** Symptom: the dashboard says 40 ms while users complain about slow feeds. Fix: plot p95 from histogram buckets, and keep averages off the dashboard.
- **Logging secrets.** Symptom: session cookies or presigned URLs appear in your log files. Fix: pino's `redact` paths for headers and known fields, and log storage keys instead of URLs.

## Say it in the interview

"Every request gets an ID at the edge. It's returned in a header, attached to every log line through `AsyncLocalStorage`, and copied into every job payload, so I can grep one upload from the API through `process-media` and `fanout` across two processes. Metrics come from `prom-client`, with route-template labels to keep cardinality bounded. The dashboard shows four numbers: p95, error rate, queue depth and cache hit rate. I chose ID correlation over full OpenTelemetry tracing because it covered the async boundary with no extra infrastructure. The tradeoff is that I don't get per-span timings inside a request, and I'd add OpenTelemetry once that question became hard to answer."

## Stretch goals

- Add OpenTelemetry auto-instrumentation to the API, export traces to a local Jaeger or Grafana Tempo container, and propagate the trace context through job data.
- Ship logs to Grafana Loki, so you can search by `requestId` from the same Grafana you use for metrics. Check Grafana's docs for the collector they currently recommend.
