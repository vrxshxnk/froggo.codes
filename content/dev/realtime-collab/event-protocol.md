---
id: event-protocol
project: realtime-collab
title: Design the event protocol before writing handlers
summary: >-
  Write down every event Huddle will ever send, with its payload, sender and receiver, before you write a single handler. Then scaffold the repo and prove one event can make a round trip.
time: 2-3 hours
doneWhen:
  - A protocol doc in your repo lists every event with its name, payload, sender, receiver and ack shape
  - message:send carries a client-generated tempId, and message:new echoes it back
  - Every event name lives in one shared constants file that both client and server import
  - A ping event goes from the browser to the server and its acknowledgement comes back, visible in the devtools WS panel
  - Your doc says what the client does when each ack never arrives
docs:
  - label: "socket.io: Emitting events (and acknowledgements)"
    url: https://socket.io/docs/v4/emitting-events/
  - label: "socket.io: How it works"
    url: https://socket.io/docs/v4/how-it-works/
  - label: "MDN: The WebSocket API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
  - label: "MDN: crypto.randomUUID()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
---

## What you're building

You end this milestone with two things. One is `docs/protocol.md`: a table of every event Huddle uses, plus the rules all events follow. The other is a running skeleton: a Vite React client and a Node server connected by socket.io, where clicking a button sends a `ping` and the server's acknowledgement comes back with the server's time.

There's no chat yet, on purpose. Design now saves renaming events across twenty files later.

## Why it matters

HTTP gave you structure for free: one URL per operation, a response for every request, status codes for errors. A WebSocket is a pipe that carries anything in either direction at any time. Without a written protocol you'll end up with `sendMessage`, `message_send` and `newMsg` all doing almost the same thing. A protocol doc shows an interviewer you think in contracts, not handlers.

## Before you start

- **Events.** In socket.io, both sides `emit(name, payload)` and listen with `on(name, handler)`. The name is a string you choose, and the payload is any JSON-serialisable value. Nothing checks that both sides agree, so your doc is the only contract.
- **Acknowledgements (acks).** If the sender passes a callback as the last argument to `emit`, the receiver's handler gets a function it can call with a reply. That's how a client learns "the server saved my message" without a separate event. See [emitting events](https://socket.io/docs/v4/emitting-events/).
- **Rooms.** A named group of sockets on the server. `socket.join("channel:42")` adds a socket, and `io.to("channel:42").emit(...)` reaches everyone in it. Clients can't see or join rooms directly.
- **Commands and facts.** A useful way to split events. Client-to-server events are commands, which are requests that may be refused (`message:send`). Server-to-client events are facts about something that already happened (`message:new`). Commands get acks. Facts don't.
- **tempId.** An id the client invents, with `crypto.randomUUID()`, before the server has seen the message. It lets the client match the server's reply to the message it drew on screen.

## Build it step by step

### Step 1: List every user action and system event

Before naming anything, write two plain lists. The first is what a user does: opens the app, joins a channel, sends a message, starts typing, reads a channel, scrolls up for history, goes offline. The second is what the system must tell people: a message arrived, someone came online or went offline, someone is typing, someone read up to here, your send failed.

For each item, ask "who needs to hear about this?" Joining a channel affects the joiner (who needs history and the online list) and the other members (who need a "joined" diff): two events with two payloads.

Check it: every feature in the project brief maps to at least one item on your lists.

### Step 2: Pick naming and payload rules

Decide your conventions once and write them at the top of the doc. A good set:

- Names are `noun:verb`: `message:send`, `presence:join`, `typing:start`.
- Client commands use present-tense verbs (`send`, `join`). Server facts use nouns or past tense (`new`, `update`, `leave`).
- Every payload is an object, never a bare string, so you can add fields later without breaking anyone.
- Every command has an ack, and every ack has the same shape.

```json
{ "ok": true, "data": { "id": 1042 } }
{ "ok": false, "error": "rate_limited", "retryAfterMs": 4000 }
```

Write the error codes you expect (`invalid_payload`, `not_found`, `rate_limited`, `unauthorized`, `server_error`) so the client can switch on them later.

Check it: a friend could name a new event correctly from your rules alone.

### Step 3: Write the table

One row per event, with the columns event, direction, payload, ack and notes. Here are three rows to show the level of detail. Fill in the rest yourself.

```text
event            dir        payload                                   ack
channel:join     C -> S     { channelId }                             { ok, data: { messages[50], online[] } }
message:send     C -> S     { tempId, channelId, body }               { ok, data: { id, sentAt } }
message:new      S -> room  { id, tempId, channelId, author, body,   (none: it's a fact)
                              sentAt }
```

You still need rows for leaving a channel, presence joins and leaves, typing start and its server-side update, read receipts, and errors. The table forces decisions. Does `message:new` go to the sender too? (Yes: their other tabs need it, and the sending tab uses it to confirm.) Who sets `sentAt`? (The server. Client clocks are often wrong.)

Check it: someone else could implement the client from your table without reading your server code.

### Step 4: Decide what happens when a reply never comes

For every command, add a line in the notes column: "if no ack within N seconds, the client does X." For `message:send` the answer is to mark it failed and offer retry. For `channel:join` it's to retry after reconnecting. Writing this now is what makes the reconnection milestone straightforward instead of a rewrite.

Also note what travels over HTTP instead. A sensible split: live events go over the socket, and bulk reads (older history, catch-up after reconnect) are plain `GET` requests to Express, which are easy to retry and test with `curl`.

Check it: no row in the table has an empty "if no ack" note.

### Step 5: Scaffold the repo

Create a Vite React app with `npm create vite@latest huddle -- --template react`. That `huddle` folder is your repo. Then add a `server/` folder and install `express`, `socket.io` and `socket.io-client`. Add a `shared/events.js` that exports every event name as a constant, and import it from both sides so a typo becomes an import error instead of a silent no-op.

In `vite.config.js`, proxy `/socket.io` (with `ws: true`) and `/api` to your Node server's port. The browser then talks to one origin in development, just as it will in production, so you have no CORS problems.

```json
"scripts": {
  "dev:client": "vite",
  "dev:server": "node --watch server/index.js"
}
```

Check it: both processes start, and the browser console shows no connection errors.

### Step 6: Prove one round trip

Create the socket client once, in its own module, not inside a component. Add a button that emits `ping` with an ack callback, and have the server reply with `{ ok: true, data: { serverTime } }`. Show the result on screen.

Open devtools, go to Network, filter by **WS**, click the socket.io connection and open its **Messages** tab. You'll see your `ping` frame go out and the ack come back. You'll use this panel in every milestone after this one.

Check it: click the button five times. You should see five pings, five acks, and only one socket connection.

## Common mistakes

- **Skipping the doc because "it's just chat."** Symptom: by the presence milestone you have three slightly different join events, and fixing one breaks another. Fix: the table is the contract. Change the table first, then the code.
- **Creating the socket inside a React component.** Symptom: two or three connections in the WS panel, and every event is handled twice, because React's StrictMode runs effects twice in development. Fix: create it once in a module and import it. Remove listeners in your effect cleanup.
- **Leaving `tempId` out of `message:new`.** Symptom: in the optimistic UI milestone, you can't tell which pending message a broadcast confirms. Fix: echo it now, even though nothing uses it yet.
- **Letting the client set timestamps or ids.** Symptom: messages sort wrongly when someone's phone clock is off. Fix: the server assigns `id` and `sentAt`. The only id a client invents is the `tempId`.

## Say it in the interview

"Before writing handlers I wrote a protocol table: every event, payload, direction and ack, plus what the client does if the ack never comes. Client events are commands that can be refused, and server events are facts. I put live events on the socket and bulk reads like history on HTTP, because HTTP is easier to retry and cache. The tradeoff is two transports to authenticate, which I handle by using the same token for both."

## Stretch goals

- Add a `v` field to your handshake (`auth: { v: 1 }`) and write down what the server does with an old client.
- Validate every incoming payload against a zod schema generated from the same file as your event names.
