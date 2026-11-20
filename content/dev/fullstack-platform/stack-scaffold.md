---
id: stack-scaffold
project: fullstack-platform
title: Choose the stack and scaffold the project
summary: >-
  Set up a Next.js app that talks to a real Postgres database through Drizzle, keep your secrets out of git from the first commit, and write a README that says what you're building and why.
time: 2-3 hours
doneWhen:
  - "`npm run dev` starts the app, and a page shows a value it read from your local Postgres"
  - "`.env.local` is listed in `.gitignore`, and `git status` never shows it"
  - "A `.env.example` with fake values is committed, so a classmate could run the project from it"
  - Your README states what Inkwell is, who it's for, the stack, and one sentence on why you chose each piece
  - The empty app is deployed and opens at a public URL
docs:
  - label: "Next.js: Installation"
    url: https://nextjs.org/docs/app/getting-started/installation
  - label: "Next.js: Environment variables"
    url: https://nextjs.org/docs/app/guides/environment-variables
  - label: "Drizzle: Get started with PostgreSQL"
    url: https://orm.drizzle.team/docs/get-started-postgresql
  - label: "Docker: Install Docker Desktop"
    url: https://docs.docker.com/get-started/get-docker/
---

## What you're building

By the end of this milestone you have a Next.js project on GitHub that connects to a Postgres database running on your laptop. One throwaway page asks the database for the time (`select now()`) and prints it, which proves the whole chain works: browser, Next.js server, ORM, database. The repo has a README that explains the project, a `.env.example` that lists every setting, and no secrets anywhere in its history.

You'll also deploy the empty app once. Nothing is on it yet, but from now on "deploy" is a button you've already pressed, not a scary last step.

## Why it matters

Every job you take will start with an existing setup, and the people who are useful fastest are the ones who understand how the pieces connect. Choosing well-known tools you can debug, writing down why, and keeping configuration out of code are habits interviewers look for. Not one of them is clever. That's the point: when your stack is well known, a stuck evening becomes a five-minute search, because thousands of people hit the same error before you.

## Before you start

- **Next.js App Router.** Next.js is a React framework where each folder under `app/` is a URL, and pages can run on the server. Server code can read the database directly and is never sent to the browser. A `route.ts` file in a folder makes an API endpoint instead of a page.
- **Postgres.** A relational database: data lives in tables with typed columns, and you query it with SQL. You'll run it locally in Docker, so it's the same everywhere and easy to throw away.
- **An ORM.** An Object-Relational Mapper lets you describe tables in TypeScript and query them with functions instead of raw strings. Drizzle stays close to SQL, so what you learn carries over to any database job. Its companion tool, drizzle-kit, turns changes to your schema into migration files.
- **Environment variables.** Settings that change between machines (database URLs, API keys) live in a `.env.local` file that git ignores, and Next.js loads them into `process.env`. Only variables prefixed with `NEXT_PUBLIC_` are sent to the browser, so a secret must never have that prefix. See the [Next.js environment variables guide](https://nextjs.org/docs/app/guides/environment-variables).

## Build it step by step

### Step 1: Create the app

Run the official generator and accept TypeScript, ESLint, Tailwind and the App Router. Name the project `inkwell`.

```bash
npx create-next-app@latest inkwell
cd inkwell && npm run dev
```

Check it: `http://localhost:3000` shows the starter page. Delete the starter content from `app/page.tsx` and replace it with a heading that says "Inkwell".

### Step 2: Start Postgres in Docker

Install Docker Desktop, then start a Postgres container with a named volume, so your data survives restarts. A `docker-compose.yml` in the repo is better than a long command you'll forget. It needs one service called `db` using the official `postgres` image, a port mapping of `5432:5432`, the `POSTGRES_PASSWORD` and `POSTGRES_DB=inkwell` environment variables, and a volume. Commit that file: it holds only a local dev password, never a real one.

Check it: `docker compose up -d`, then `docker compose exec db psql -U postgres -c "select now();"` prints a timestamp. If port 5432 is already taken, you have another Postgres running. Map to `5433` instead.

### Step 3: Keep secrets out of git before the first secret exists

Create `.env.local` with your connection string, and `.env.example` with the same keys and fake values. Then open `.gitignore`. The generator adds a rule for env files, but recent versions ignore every file starting with `.env`, which also hides your example file. If so, add a `!.env.example` line below that rule.

```bash
# .env.example (commit this one)
DATABASE_URL=postgres://postgres:password@localhost:5432/inkwell
```

Do this now, not later. A secret that reaches a public GitHub repo has to be treated as leaked, even if you delete it in the next commit, because git history keeps it and bots scan new pushes.

Check it: `git status` lists `.env.example` but not `.env.local`.

### Step 4: Connect Drizzle

Install `drizzle-orm`, the `pg` driver, and `drizzle-kit` as a dev dependency. Create one module, for example `src/db/index.ts`, that builds the database client from `process.env.DATABASE_URL` and exports it. Everything else imports `db` from there. Add a `drizzle.config.ts` that points drizzle-kit at your schema file and your database URL, and add package scripts so commands are easy to remember:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

Import `db` only in server files: server components, route handlers and modules they use. If it ever ends up in a `"use client"` file, the build fails, which is the safety net working.

Check it: create a throwaway `app/health/page.tsx` (a server component) that runs `select now()` through Drizzle's `sql` helper and prints the result. Refresh: the time changes. Stop the container and refresh: you see an error, not a blank page. Restart it.

### Step 5: Write the README

Write it before more code, because it forces decisions. Include what Inkwell is in two sentences, who it's for, the feature list, the stack as a short table with a reason for each choice, and how to run it locally (clone, copy `.env.example` to `.env.local`, `docker compose up -d`, `npm run dev`). Leave a "Security" heading with a TODO; you'll fill it in as you build.

Check it: ask a friend to follow only the README on their machine. Every question they ask is a missing line.

### Step 6: Commit, push and deploy the empty app

Make your first commit, push to GitHub, then import the repo in Vercel. The deploy will build fine, but `/health` will fail on Vercel because there's no database there yet. That's expected: you'll wire up a production database in the [deploy milestone](/development/fullstack-platform/deploy-envs). For now, delete the health page or leave it as a known failure, and note in the README that production isn't connected.

Check it: the Vercel URL opens your "Inkwell" heading on your phone.

## Common mistakes

- **Committing `.env.local`.** Symptom: your database URL or keys are visible on GitHub. Fix: rotate (replace) every secret in it, then add the file to `.gitignore`. Deleting the commit isn't enough, because it stays in history and may already have been copied.
- **Importing `db` into a client component.** Symptom: build errors about `fs`, `net` or `pg` that you don't recognise. Fix: keep database code in server-only modules. Install the `server-only` package and import it at the top of `src/db/index.ts`, so a mistake fails loudly with a clear message.
- **Creating a new database client in every file.** Symptom: in dev, after many hot reloads, you see `sorry, too many clients already`. Fix: create the client once in one module and import it everywhere.
- **Picking an exciting stack you can't debug.** Symptom: hours lost to an error with no search results. Fix: use the well-known defaults, and save experiments for a side branch.

## Say it in the interview

"I chose Next.js, Postgres and Drizzle because they're well documented and I can debug them. When something broke, the answer was always one search away. I ran Postgres in Docker so my setup is reproducible, and I set up the env files before writing any secret, with a `.env.example` committed so anyone can run it. The tradeoff with Drizzle over Prisma is less hand-holding, but my queries read like SQL, so I understand what the database is actually doing."

## Stretch goals

- Add a GitHub Actions workflow that runs `npm run lint` and a type check on every push.
- Add a `db:reset` script that drops and recreates your local database, so you can start clean in seconds.
