---
id: deploy-realtime
project: realtime-collab
title: Deploy somewhere WebSockets actually work
summary: >-
  Ship Huddle as one long-running Node service on a persistent host such as Render, Railway or Fly.io, with managed Postgres, and write the README paragraph that explains why you chose this over serverless.
time: 2-3 hours
doneWhen:
  - Your app is live on HTTPS, and the devtools WS panel shows a wss:// connection with status 101, not just polling requests
  - A phone on mobile data and a laptop can chat in real time
  - Redeploying while two clients are connected makes both reconnect and catch up without a refresh
  - Secrets live only in the host's environment settings, and nothing secret is in git
  - Your README has a hosting tradeoff paragraph naming what you chose, what you gave up and what you'd change at scale
docs:
  - label: "Render: WebSockets on Render"
    url: https://render.com/docs/websocket
  - label: "Fly.io documentation"
    url: https://fly.io/docs/
  - label: "Railway documentation"
    url: https://docs.railway.com/
  - label: "socket.io: Using multiple nodes"
    url: https://socket.io/docs/v4/using-multiple-nodes/
  - label: "socket.io: Troubleshooting connection issues"
    url: https://socket.io/docs/v4/troubleshooting-connection-issues/
---

## What you're building

A public URL your friends can open on their phones. One Node process serves the built React client, the `/api` routes and the socket server, all on the same origin over HTTPS. It talks to a managed Postgres database. When you push to `main`, the host builds and restarts it, and everyone connected sees a brief "Reconnecting..." banner, then carries on with nothing lost, because you built that in the [reconnection milestone](/development/realtime-collab/reconnect-offline).

## Why it matters

Your host has to match how your app works. A chat server holds connections for hours, while serverless functions answer a request and stop. Choosing the host, and saying why, is an architecture decision. The paragraph you write here, covering what you picked, what it costs you and what you'd do at a larger scale, is the kind of reasoning interviewers want to hear.

## Before you start

- **Persistent host versus serverless.** A persistent host runs your process continuously, like your laptop does. Serverless function platforms start your code per request and shut it down when the response is done or a time limit is hit, so they can't hold a socket open for hours. You can host the static client anywhere, but the socket server needs a persistent process.
- **The upgrade.** A WebSocket starts life as an HTTP request asking to "upgrade", and the server answers with status `101 Switching Protocols`. socket.io starts with HTTP long-polling and then tries to upgrade. If a proxy blocks the upgrade, it keeps working over polling, which is slower and heavier. That's why you check the WS panel, not just "does chat work?"
- **SIGTERM.** When a host redeploys or restarts your service, it sends the process a `SIGTERM` signal and gives it a short time to exit. Handling it lets you close sockets and the database pool cleanly instead of being killed mid-write.
- **One instance.** With two or more instances, a user on instance A wouldn't get a broadcast sent on instance B, and long-polling requests need to reach the same instance every time ("sticky sessions"). socket.io solves this with an adapter, such as Redis. For this project, run one instance and explain why.

## Build it step by step

### Step 1: Make the server production-shaped

First, on your machine:

- Listen on `process.env.PORT`, because the host chooses the port.
- In production, have Express serve Vite's build output (`dist/`) with `express.static`, and send `index.html` for any other non-API route so client-side routing works.
- Connect the client with `io()` and no URL, so it uses the page's own origin. In development, Vite's proxy already makes this true.
- Add a `GET /healthz` route that returns 200 if the database answers a trivial query.
- Turn off your dev-only flags (`DEV_DROP_AFTER_SAVE`, `DEV_SLOW_SAVE_MS`) and the stats logger, unless they're explicitly enabled.

```json
"scripts": {
  "build": "vite build",
  "start": "node server/index.js"
}
```

Check it: run `npm run build`, then `NODE_ENV=production npm start`, and open the app on the server's port. Chat works with no Vite running.

### Step 2: Handle shutdown gracefully

On `SIGTERM`, stop accepting new connections, close the socket server (`io.close()` disconnects every client, and their reconnect logic takes over), close the database pool, then exit. Add a timeout that forces an exit after a few seconds, in case something hangs.

Check it: start the production build locally, connect two windows, and send the process `SIGTERM` with `kill <pid>`. The logs show a clean shutdown. Start it again, and both windows reconnect and catch up.

### Step 3: Create the database and environment

Create a managed Postgres database. Render, Railway and Fly.io all offer one, or you can use Neon or Supabase. Check the provider's docs for current free-tier limits, because they change. Run your migrations against it with your migration tool, not by pasting SQL into a console, and seed the channels.

In the host's settings, add the environment variables your server reads. Keep a matching `.env.example` with fake values in git:

```bash
DATABASE_URL=postgres://user:password@host:5432/huddle
JWT_SECRET=replace-with-a-long-random-string
NODE_ENV=production
```

Use a fresh `JWT_SECRET` in production.

Check it: `git grep JWT_SECRET` finds only `.env.example` and the code that reads it.

### Step 4: Deploy as a web service

Create a web service from your GitHub repo on your chosen host. Set the build command to `npm ci && npm run build` and the start command to `npm start`, and point its health check at `/healthz` if the host supports one. Each host's docs explain how WebSockets work on their platform: read that page before you deploy, especially anything about idle timeouts and whether free instances sleep. A sleeping instance cuts every socket, and the first visitor waits for it to wake up.

Check it: open the live URL, sign in, and open devtools: Network, then WS. You see a `wss://` connection with status 101, and frames flowing in its Messages tab.

### Step 5: Test it like a user would

Use two real devices. Open the app on your phone using mobile data (not your Wi-Fi) and on your laptop. Chat, then switch the phone to airplane mode, send two messages, and switch it back. Then push a small commit and watch both devices while the host redeploys. Both should show the banner, reconnect and catch up.

If the WS panel shows only repeated polling requests, the upgrade is failing. Work through socket.io's troubleshooting guide, and check that you didn't restrict `transports` in a way your host doesn't support.

Check it: after the redeploy, the message count in both windows matches `select count(*)` from the production database.

### Step 6: Write the tradeoff paragraph

In your README, add a "Hosting" section of five or six sentences. Name the host and why it suits long-lived connections. Name what you considered instead: serverless functions (they can't hold the socket), and a managed real-time service, which would handle connections for you at the cost of a vendor dependency and less to show for your own engineering. Name the limits of your setup: one instance, presence and rate limits in memory, and every client reconnecting at once on deploy. Then say what you'd change to scale it: multiple instances behind sticky sessions, the socket.io Redis adapter, and presence and rate limits moved to Redis.

Check it: a friend who has never heard of WebSockets can read the paragraph and tell you why you didn't use Vercel functions for the server.

## Common mistakes

- **Deploying the socket server to serverless functions.** Symptom: connections drop after seconds, or never upgrade, and messages arrive late or not at all. Fix: a persistent web service.
- **Hard-coding `localhost` in the client.** Symptom: it works on your laptop and shows "Reconnecting..." forever for everyone else. Fix: `io()` with no URL, served from the same origin.
- **Mixed content.** Symptom: the browser blocks a `ws://` connection from an HTTPS page. Fix: same origin, so socket.io uses `wss://` automatically.
- **Running a second instance "for reliability."** Symptom: some users miss messages, and others see "Reconnecting..." loops. Fix: one instance, or sticky sessions plus an adapter.
- **Committing `.env`.** Symptom: your production secret is on GitHub, and you have to rotate it. Fix: add `.env` to `.gitignore` before the first commit, and put secrets in the host's settings.

## Say it in the interview

"Huddle runs as one long-lived Node service on a persistent host, because serverless functions can't hold a WebSocket open. The client, API and sockets share one origin, so there's no CORS and the connection is always wss. I run one instance on purpose: a second would need sticky sessions and a Redis adapter, which I've documented as the scaling path. Deploys do disconnect everyone, but the clients' reconnect-and-catch-up protocol makes that a two-second banner instead of lost messages."

## Stretch goals

- Run two instances locally behind a proxy with the socket.io Redis adapter, and show that messages cross between them.
