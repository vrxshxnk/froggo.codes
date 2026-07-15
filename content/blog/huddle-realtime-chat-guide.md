---
title: "Project 4: Huddle — Real-Time Chat Is a Failure-Handling Exam"
excerpt: "The full build guide for Project 4 of our Development Roadmap. WebSockets, presence, optimistic sends, reconnection — and why every real-time feature is secretly a question about what happens when the network drops."
date: "2026-07-12"
author: "Froggo"
tags: ["projects", "roadmap", "websockets", "realtime", "backend"]
featured: false
---

Every chat tutorial on the internet shows you the same thing: open a socket, emit a message, append it to a list. Twenty minutes, works great on localhost. What none of them show you is what happens when a laptop lid closes mid-typing-indicator, when the same user has three tabs open, when a message is sent during a subway tunnel, or when the server restarts and every client reconnects at once.

Those aren't edge cases. In real-time systems, **failure handling is the feature**. The happy path is the demo; everything else is the product. That's why Huddle exists as [Project 4 of the Development Roadmap](/development), and why interviewers love asking "what happens if the network drops?" — the answer instantly reveals whether you've built real-time for real.

## Milestone 1 is a table, and it's the most important artifact in the project

Before writing a single handler, the roadmap has you design the event protocol — every event's name, payload, sender, and receiver — as a document. Something like:

| Event | Payload | Sent by | Received by |
|---|---|---|---|
| `message:send` | `{ tempId, channelId, body }` | client | server |
| `message:new` | `{ id, tempId, channelId, author, body, sentAt }` | server | channel members |
| `presence:join` / `presence:leave` | `{ channelId, user }` | server | channel members |
| `typing:start` | `{ channelId }` | client | server → members |

Why insist on this before code? Because WebSockets remove the structure HTTP gave you for free. HTTP forced request/response pairs, status codes, one URL per operation. A socket is just a pipe — any shape, any direction, any time. Without a written protocol, your event names and payloads accrete one debugging session at a time, and within a week you have `sendMessage`, `message_send`, and `newMsg` coexisting and nobody knows which is real.

Notice `tempId` in the send payload, echoed back in `message:new`. It looks pointless now. It is the entire mechanism behind optimistic UI in milestone 5, and retrofitting it later means touching every send path. This is what protocol design *is* — paying one sentence now to avoid a refactor later.

## Presence: users are not sockets

Milestone 2 contains the bug that every first chat app ships: treating a socket connection as a user. One user with the app open in three tabs is three sockets. Track presence by socket and your sidebar shows them online three times; worse, when they close *one* tab you mark them offline while two tabs are still open.

The fix is a two-level map: socket IDs grouped under user IDs. A user is online if they have *at least one* live socket, and goes offline only when their socket count hits zero. This "one logical identity, many physical connections" pattern shows up everywhere in distributed systems — you're just meeting it early.

Also from the hints, a bandwidth lesson disguised as a UX detail: broadcast presence *diffs* ("Ana joined"), not full lists, and send the complete roster only when someone joins a channel. Full-list broadcasts are quadratic — every join sends everyone to everyone — and quadratic things have a way of being fine right up until they aren't.

## Write to the database before you broadcast

Milestone 3 is one sentence of ordering with years of pain behind it: **persist the message first, broadcast second.**

Broadcast first and there's a window — small, but real — where every recipient has seen a message that exists nowhere durable. Server crashes in that window, and the message is gone from history while remaining in people's memory of the conversation. Recipients saw it; the record disagrees. These are the worst bugs in software: unreproducible, reported vaguely ("I swear someone said..."), impossible to debug after the fact.

Database write first means the failure mode flips to the harmless direction: a crash might mean a saved message that wasn't broadcast — and the client's catch-up logic (milestone 6) will deliver it on reconnect anyway. When you have to choose an ordering across a possible failure, choose the one whose failure is recoverable. That instinct is most of distributed systems.

History loading follows the same pattern you learned in Inkwell: last 50 messages on join, then cursor pagination as the user scrolls up.

## Typing indicators: never trust a goodbye

Milestone 4 looks like fluff and contains my favorite lesson in the project. The naive typing indicator listens for `typing:start` and `typing:stop`. The problem is that **`stop` events are promises made by machines that are about to vanish.** A closed laptop sends nothing. A killed tab sends nothing. A subway tunnel sends nothing. Result: "Ana is typing..." burns on screen forever, and every user of your app learns to distrust it.

The fix inverts the trust model: `typing:start` sets a server-side timer that auto-expires after ~3 seconds. Continued typing refreshes it. A `stop` event clears it early if it arrives — a courtesy, not a dependency. The indicator now degrades correctly no matter how the client dies.

Generalize this and you get a rule worth keeping: in distributed systems, *absence of a signal must have safe semantics*, because absence is the one message every failed component reliably sends. Read receipts in the same milestone teach a storage-shape lesson with the same energy: store one `last_read_message_id` per user per channel, not a boolean per message — one row versus millions, with identical information.

## Optimistic UI: lie to the user, then reconcile honestly

Milestone 5 is where `tempId` pays off. When a user hits Enter, you render their message *instantly*, in a subtle "sending" state, tagged with a client-generated tempId. The server saves it, then broadcasts the real message with the tempId echoed back. The client finds its optimistic placeholder by tempId and swaps in the confirmed version. On failure: mark it failed, offer retry. 

Two rules keep the lie honest. First, the swap happens *in place* — never reorder messages under the user's cursor, even if server timestamps disagree with local order. Users forgive latency; they do not forgive text jumping while they read it. Second, a failed send stays visible with a retry affordance. Silently dropping a message the user watched appear is worse than never showing it.

This send → pending → confirmed/failed flow is a small state machine, and it's the exact pattern behind every responsive-feeling app you use — likes, upvotes, message sends everywhere. (It's also precisely how the progress ticks work on our own roadmap page, complete with rollback on failure. Patterns recur; that's why they're patterns.)

## Reconnection is a protocol, not an event handler

Milestone 6: the network *will* drop, so define what happens, deliberately. Disconnect: show a banner, queue outgoing messages locally. Reconnect: re-join channels, flush the queue, and — the step everyone forgets — **fetch everything after the last message ID you have.** Reconnecting without catch-up means every network blip silently eats the messages sent while you were gone, and users experience it as "sometimes I just don't see messages," the kind of trust-destroying bug that never makes it into a bug report.

Test it the way the hint says: devtools network throttling, offline, repeatedly, mid-send. Chaos-test it by hand. Ten minutes of deliberately breaking your own connection finds more real bugs than a week of happy-path use.

## An unauthenticated socket server is a free botnet

Milestone 7, bluntly: the WebSocket handshake must be authenticated with the same rigor as your HTTP API — same token, verified server-side, before the socket joins anything. It's easy to forget because socket connections don't *feel* like API requests, but an open socket server is an anonymous, rate-unlimited write path into your system, and the internet's background radiation of scanners will find it.

Then rate-limit per *user* (not per socket — three tabs, remember): a token bucket of ~10 messages per 10 seconds is generous to humans and hostile to scripts. Cap message length server-side. The security boundary from Project 3 didn't go away because the transport changed.

## The load test will find your leak. That's the point.

Milestones 8 and 9 close the project: simulate a few hundred concurrent clients with k6 or artillery, watch memory and event-loop lag — and, almost certainly, discover that memory climbs and never comes down. You have a leak, and it's nearly always the same one: event listeners registered per-connection that aren't cleaned up on disconnect. Every real-time system ever built has had this bug at least once. The load test exists so you find yours before your users do; *finding it is the milestone*.

Then deploy somewhere WebSockets actually work — a persistent host like Railway, Render, or Fly.io — because serverless platforms are built around short-lived request handlers and will kill your long-lived connections. Write the tradeoff you chose into the README. That paragraph, explaining why your architecture matches your infrastructure, is — as the roadmap puts it — interview gold.

## What this project proves

Huddle demonstrates the instincts that pure CRUD work never exercises: reasoning about ordering, trust, absence, and failure. When an interviewer asks "what happens if the network drops?", you won't have to imagine the answer. You'll have a banner, a queue, a catch-up fetch, and a reconciliation flow you built and broke and rebuilt.

---

**Ready to build it?** All nine milestones with hints are on the [Development Roadmap](/development) — free, sign in to track progress. Previously: [Project 3, Inkwell](/blog/inkwell-blog-platform-guide). Next: [Project 5, Lilypad Market](/blog/lilypad-market-payments-guide), where real money enters the system and every bug gets a dollar amount.
