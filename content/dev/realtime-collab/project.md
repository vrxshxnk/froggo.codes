---
id: realtime-collab
name: Huddle
tagline: A real-time chat app that survives dropped networks
summary: >-
  Build a Slack-style chat app with channels, presence, typing indicators, optimistic sends and reconnection, and learn to reason about ordering and failure, which is what "what happens if the network drops?" is really asking.
time: About 2 weeks, 30-35 hours
---

## What you're building

Huddle is a small team chat app. You sign in, see a sidebar of channels (#general, #placements, #random), and each channel shows who's online right now. Messages appear the instant you press Enter, other people see them within a fraction of a second, and you can see "Ravi is typing..." and "Seen by Ana" under the latest message. Scroll up and older history loads smoothly.

The interesting part is what happens when things go wrong. Turn off your Wi-Fi mid-message and a banner says "Reconnecting...", your message waits in a queue, and when the network returns it is sent exactly once, and you also get every message you missed while you were gone. Restart the server and every client reconnects and catches up without anyone refreshing. Open the app in three tabs and you still show up as one person.

## Features

- Channels you can join, with history saved in a database
- Live presence per channel: who is online, updated as people come and go
- Typing indicators that clear themselves even if the typist's laptop dies
- Read receipts based on the last message each person has read
- Optimistic sends: your message shows instantly, then is confirmed or marked failed with a retry button
- Reconnection: an offline banner, a local send queue, and a catch-up fetch of missed messages
- Authenticated sockets, per-user rate limits and server-side message length caps
- A load test with a few hundred simulated clients, and the memory leak it found
- A deployment on a host that keeps WebSocket connections open

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| Server | Node.js (20 or newer) with Express | One long-running process serves the HTTP API, the socket server and, in production, the built client. |
| Real-time | socket.io v4 (`socket.io` and `socket.io-client`) | Rooms, acknowledgements, heartbeats and automatic reconnection are built in, so you spend your time on the hard parts. The alternative is the native `ws` package, which is a fine choice if you want to build rooms, acks and reconnection yourself. Every milestone still applies. |
| Database | PostgreSQL through the `pg` package | Message ids from an identity column give every channel one order, and cursor queries on them are simple SQL. If you used Prisma or Drizzle in Inkwell, keep using it. |
| Client | React with Vite | A reducer holding messages per channel makes the optimistic and catch-up logic testable. |
| Auth | A JWT your server signs (`jsonwebtoken`), passwords hashed with `bcrypt` | The same token works for the HTTP API and the socket handshake. |
| Validation | zod | Every incoming event payload is untrusted input, exactly like an HTTP body. |
| Load testing | Artillery, using its socket.io engine | It speaks the socket.io protocol out of the box. k6 is the better choice if you chose native `ws`. |
| Hosting | Render, Railway or Fly.io, plus managed Postgres | Persistent processes that keep sockets open. Check each provider's docs for current pricing and free-tier rules. |

Keep it in one repo with one `package.json`: Vite's `index.html` and `src/` for the client at the root, `server/` for Node, and `shared/` for the event names both sides import.

## How it fits together

```text
  React client (tab 1, tab 2, phone...)
     │  socket.io (WebSocket)        │  HTTP (fetch)
     │  send, join, typing, read     │  login, older history, catch-up
     ▼                               ▼
  ┌──────────────── Node server ─────────────────┐
  │ io.use(auth) ──► event handlers ──► zod      │
  │                    │        │                │
  │   in-memory: presence map, typing timers,    │
  │              rate-limit buckets              │
  └────────────────────┼─────────────────────────┘
                       ▼
                   PostgreSQL
        users, channels, channel_members, messages
```

Follow one message. You type "anyone free for mock interviews?" and press Enter. The client generates a `tempId` with `crypto.randomUUID()`, adds the message to its own list with status `sending`, and emits `message:send` with an acknowledgement callback. On the server, the handler checks your rate-limit bucket, validates the body with zod, and inserts the row into `messages`. Only after the insert succeeds does it broadcast `message:new` to the channel's room, with the new id and your `tempId`. Your tab finds its placeholder by `tempId` and swaps in the saved message in place. Everyone else's tabs append it. If the network died anywhere along that path, the ack times out, the message is marked failed or queued, and a retry with the same `tempId` can never create a duplicate.

## Out of scope

- **Direct messages, threads, reactions and file uploads.** Each is more of the same event-plus-table work. One solid channel flow teaches more.
- **Running more than one server instance.** Scaling out needs sticky sessions and a shared adapter such as Redis. Explain it in your README and interview, but run one instance.
- **End-to-end encryption.** It's a different project. Use HTTPS and WSS, and say so.
- **Push notifications and email digests.** They need service workers and a mail provider, and teach nothing about sockets.
- **Private channels and roles.** Every signed-in user can join every channel. The authorization lesson you need is in the security milestone.

## How to work through it

1. **Foundations** (event protocol, channels and presence, persistence): about 11 hours. The protocol table decides how pleasant everything after it is.
2. **Feel** (typing and receipts, optimistic sends): about 7 hours.
3. **Failure** (reconnection and offline queueing, rate limiting and auth): about 9 hours. This is the heart of the project, so don't rush it.
4. **Proof** (load test, deploy): about 6 hours.

Until the security milestone, identity is a deliberate shortcut: a dev-only "pick a user" screen sends a `userId` the server trusts. You'll replace it with real tokens, and seeing how easily it can be faked is part of the lesson.

The rule that decides how this goes: **every feature must have a defined behaviour when a signal never arrives.** A stop event that never comes, an ack that never returns, a socket that vanishes without saying goodbye. If you can't say what your code does in each case, it isn't finished. Test it with two browser windows side by side, with devtools set to offline, and by killing the server mid-send.

## Show it off

Your README should include:

- The event protocol table, copied from your design doc
- A GIF of two windows: one goes offline, sends two messages, comes back, and both windows end up with the same history in the same order
- A short "failure modes" section listing what happens when the network drops, the server restarts, or an ack is lost
- Your load-test numbers and the leak you found
- The hosting tradeoff paragraph from the deploy milestone

In your demo, kill the server while a message is sending, start it again, and show that the message arrives once. Very few student chat apps survive that.

Resume bullets to adapt (use your own numbers):

- "Built a real-time chat app with socket.io and Postgres featuring presence, typing indicators, optimistic sends with idempotent retries, and offline queueing with catch-up on reconnect"
- "Load-tested the socket layer with X simulated clients using Artillery, found and fixed a per-connection memory leak, and held p99 event-loop delay under Y ms"
