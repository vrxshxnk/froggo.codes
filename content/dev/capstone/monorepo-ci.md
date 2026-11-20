---
id: monorepo-ci
project: capstone
title: Set up the monorepo with CI
summary: >-
  Scaffold three apps (web, api, worker) and two shared packages (types and validation) in one pnpm workspace, start Postgres and Redis with Docker Compose, and make GitHub Actions run lint, typecheck and tests on every pull request.
time: 5-7 hours
doneWhen:
  - "`pnpm install` at the root installs everything, and `pnpm dev` starts web, api and worker together"
  - "`docker compose up -d` starts Postgres and two Redis containers, and the API's `/healthz` reports all three as reachable"
  - The worker imports a job payload type from `packages/types`, and renaming a field there breaks the API's typecheck
  - A pull request shows a green CI check that ran lint, typecheck and tests
  - A pull request with a deliberate type error shows a red check and can't be merged into main
docs:
  - label: "pnpm: Workspaces"
    url: https://pnpm.io/workspaces
  - label: "Turborepo docs"
    url: https://turbo.build/repo/docs
  - label: "GitHub Docs: Creating PostgreSQL service containers"
    url: https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers
  - label: "GitHub Docs: About protected branches"
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - label: "Docker Docs: Docker Compose"
    url: https://docs.docker.com/compose/
---

## What you're building

One repository containing three runnable apps and two libraries. `apps/web` is the Next.js client, `apps/api` is the Express server, and `apps/worker` is a Node.js process that will run background jobs. `packages/types` holds shared TypeScript types, most importantly the shape of every queue job. `packages/validation` holds Zod schemas used by both the API and the web forms. One `docker compose up` starts the infrastructure, and every pull request gets a CI check that blocks the merge if anything fails.

Nothing user-facing exists yet. What exists is the skeleton every later milestone hangs on, with the safety net already in place.

## Why it matters

Ripple's API and worker deploy separately but talk through queue payloads, and that payload is a contract. In two copies, one side changes and the other fails at runtime, inside a job, where nobody sees it. Shared types make that a compile error. CI from the first commit matters similarly: adding lint rules and tests to a grown codebase means fixing hundreds of violations at once, so teams give up. Now it costs an hour.

## Before you start

- **Workspaces.** A pnpm workspace is one repo with many `package.json` files. Packages depend on each other by name, for example `"@ripple/types": "workspace:*"`, and pnpm links them locally instead of downloading anything.
- **Task runner.** Turborepo runs a script such as `test` across every package in dependency order, in parallel, and skips unchanged packages using its cache.
- **Docker Compose.** A YAML file that describes containers (Postgres, Redis) and starts them together. Your apps run on your machine with `pnpm dev` and connect to the containers through mapped ports.
- **CI service containers.** GitHub Actions can start Postgres and Redis next to your test job, so integration tests run against real databases, not mocks.
- **Required status checks.** A branch protection rule (or ruleset) on `main` that refuses merges until named checks pass. Without it, CI is only a suggestion.

## Build it step by step

### Step 1: Create the workspace layout

Create the root `package.json`, a `pnpm-workspace.yaml` that lists `apps/*` and `packages/*`, and a `turbo.json` that defines `build`, `dev`, `lint`, `typecheck` and `test`. Scaffold `web` with `create-next-app`, and create `api` and `worker` by hand as small TypeScript packages. Give every package a scoped name (`@ripple/api`, `@ripple/types`).

```text
ripple/
  apps/web  apps/api  apps/worker
  packages/types  packages/validation  packages/config (tsconfig, eslint)
  docs/design.md   docker-compose.yml   turbo.json   pnpm-workspace.yaml
```

Check it: `pnpm -r list --depth -1` prints all six packages.

### Step 2: Share one TypeScript and lint config

Put a base `tsconfig` and ESLint config in `packages/config`, and extend them from every app. Turn on `strict`. Choose one way to consume the shared packages and stick to it. The simplest is to point `main`/`types` at the TypeScript source and let each app compile it (Next.js needs `transpilePackages` for this). The alternative is building each package to `dist`, which is more setup for little gain at this size.

Check it: `pnpm turbo run typecheck` passes across all packages, and introducing `let x: number = "a"` in any one of them fails it.

### Step 3: Define the job contracts in packages/types

Write the payload type for each queue you know you'll need: `process-media`, `fanout`, `notify`. Every payload carries a `requestId` from the start, because the [observability milestone](/development/capstone/observability) depends on it and adding it later means touching every producer.

```json
{ "queue": "process-media", "data": { "postId": "01J...", "mediaIds": ["01J..."], "requestId": "a3f1..." } }
```

Then add a matching Zod schema in `packages/validation`, so the worker can validate a payload at runtime before trusting it.

Check it: rename `postId` to `id` in the type. Typecheck should fail in both `api` (the producer) and `worker` (the consumer). Rename it back.

### Step 4: Start the infrastructure with Docker Compose

Define three services: `postgres`, `redis-cache` and `redis-queue`. There are two Redis containers on purpose. The queue Redis must never evict keys (BullMQ asks for `maxmemory-policy noeviction`), while the cache Redis should evict old keys when it fills up. One Redis can't do both. Add health checks, and give Postgres a named volume so data survives restarts.

```bash
docker compose up -d
docker compose ps        # all three should say "healthy"
psql "$DATABASE_URL" -c "select version();"
```

Put connection strings in `.env.example` with fake values (`DATABASE_URL`, `REDIS_CACHE_URL`, `REDIS_QUEUE_URL`) and add `.env` to `.gitignore`.

Check it: add a `GET /healthz` route to the API that pings all three, and returns 503 if any of them is down. Stop one container and watch the route fail.

### Step 5: Write one real test per app

Add Vitest to `api` and `worker`. Write one test that matters: an API test that starts the app and calls `/healthz`, and a worker test that runs a handler for a fake `process-media` payload against the real Postgres. Keep a separate test database (`ripple_test`) so tests can truncate tables freely.

Check it: `pnpm turbo run test` passes locally with the containers up, and fails with a clear connection error when they're down.

### Step 6: Add the GitHub Actions workflow

Create `.github/workflows/ci.yml`, triggered on `pull_request` and on pushes to `main`. One job is enough: check out the code, set up pnpm and Node with dependency caching, install with `pnpm install --frozen-lockfile`, then run lint, typecheck and test through Turborepo. Declare Postgres and Redis as `services` on the job, with health-check options, so the integration tests have something to talk to. Run your migrations before the tests.

Check it: open a pull request. The check should go green in a few minutes, and the log should show the Postgres service starting.

### Step 7: Protect main and record the decision

In the repo settings, require the CI check to pass before merging into `main`. Then open a pull request with a deliberate type error to confirm the merge button is blocked. From now on, every milestone lands as a pull request.

In your design doc, add a short "Repository and delivery" section. Explain why it's a monorepo and not separate repos: shared contracts and atomic changes across API and worker, at the cost of one bigger CI run. Also explain why there are two Redis instances.

Check it: the broken pull request shows a red check, and GitHub says merging is blocked.

## Common mistakes

- **Copying types between api and worker.** Symptom: the worker throws `Cannot read properties of undefined` on a job, while the API compiles happily. Fix: both import from `@ripple/types`, and the worker validates with the shared Zod schema.
- **One Redis for queue and cache.** Symptom: under memory pressure, jobs silently disappear, or BullMQ logs a warning about the eviction policy. Fix: two Redis instances, the queue one set to `noeviction`.
- **Mocking the database in tests.** Symptom: tests pass, but the real query fails on a missing index or a constraint. Fix: use service containers in CI and a real test database locally.
- **CI that nobody is forced to wait for.** Symptom: `main` goes red and stays red for days. Fix: make the check required on `main`.
- **Installing without the lockfile.** Symptom: CI breaks one morning with no code change. Fix: `pnpm install --frozen-lockfile` in CI, and commit `pnpm-lock.yaml`.

## Say it in the interview

"Ripple is a pnpm and Turborepo monorepo with web, api and worker apps, and shared packages for types and Zod schemas. The API and worker deploy separately but communicate through queue payloads, so I made each payload a shared type. A contract change fails the typecheck, not a job in production. CI ran lint, typecheck and integration tests against real Postgres and Redis service containers from the first pull request. The tradeoff is a slower CI run than mocks would give, which I took because mocked databases hide exactly the bugs this project is about."

## Stretch goals

- Turn on Turborepo's remote cache so that unchanged packages skip their tests in CI.
- Add a Dockerfile per app with a multi-stage build, and have CI build the images on main.
