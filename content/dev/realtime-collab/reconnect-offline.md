---
id: reconnect-offline
project: realtime-collab
title: Handle reconnection and offline queueing
summary: >-
  When the network drops, show a banner and queue outgoing messages. When it returns, re-join channels, fetch everything you missed after your last message id, and send the queue in order, exactly once.
time: 4-5 hours
doneWhen:
  - Going offline shows a "Reconnecting..." banner within a couple of seconds, and it disappears on reconnect
  - Three messages typed while offline are sent on reconnect, in the order you typed them, and each appears once
  - Messages other people sent while you were offline appear after you reconnect, even if there were more than 50
  - Restarting the server while two windows are open leaves both with identical history and presence, with no refresh
  - Refreshing the page while offline keeps your queued messages
docs:
  - label: "socket.io: Client offline behavior"
    url: https://socket.io/docs/v4/client-offline-behavior/
  - label: "socket.io: The Socket instance (client)"
    url: https://socket.io/docs/v4/client-socket-instance/
  - label: "socket.io: Connection state recovery"
    url: https://socket.io/docs/v4/connection-state-recovery
  - label: "MDN: Navigator.onLine"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
  - label: "MDN: Window.localStorage"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
---

## What you're building

Turn off your Wi-Fi mid-conversation. A banner slides in: "Reconnecting...". You keep sending, and your messages show as "Queued". Meanwhile your friend sends 80 messages in another window. Turn the Wi-Fi back on: the banner goes, all 80 of their messages appear above your queued ones, and then your three messages send, in order, and turn solid. Nobody refreshed anything, and nothing appears twice.

## Why it matters

Asked "what happens if the network drops?", many candidates say "socket.io reconnects automatically." Reconnecting the pipe is the easy part. What's lost is everything from while it was down: room membership, events broadcast in the gap, and anything the user tried to send. This milestone proves you can define recovery as a protocol and test it deliberately, the same thinking behind replication, mobile sync and message queues.

## Before you start

- **A new socket is a new socket.** After a reconnect, the server sees a fresh connection with a new `socket.id`. Rooms it was in, presence entries and typing timers all belong to the old one. The client must rebuild its server-side state every time.
- **Events in the gap are gone.** socket.io's server doesn't store broadcasts for clients that weren't connected. Its [connection state recovery](https://socket.io/docs/v4/connection-state-recovery) feature can replay a short gap from memory, but not after a server restart, so your database is the real source of catch-up.
- **The client's buffer.** By default, socket.io's client buffers events you emit while disconnected and sends them all when it reconnects. That sounds helpful, but it hides what's queued, and your 5-second ack timeouts keep counting while the event sits there. You'll manage the queue yourself and leave nothing in socket.io's buffer.
- **`navigator.onLine` is a hint.** It's `false` when the device has no network at all, and the `online` and `offline` events tell you when that changes. When it's `true`, you might still not reach the internet, so use it only to word the banner, never to decide whether a send worked.

## Build it step by step

### Step 1: Track connection status and show the banner

Add a `connection` field to your state with three values: `connected`, `reconnecting` and `offline`. Set it from the socket's `connect` and `disconnect` events and from the window's `online` and `offline` events. Show the banner after the connection has been down for about a second, so a quick blip doesn't flash it. Say what's true: "Reconnecting..." if the device is online, "You're offline. Messages will send when you're back." if it isn't.

Check it: run `socket.io.engine.close()` in the console (expose the socket on `window` in dev). The banner appears, then disappears when it reconnects a moment later.

### Step 2: Queue sends instead of emitting

Your optimistic messages already sit in state with a status. Add a `queued` status. When the user sends while `connection` isn't `connected`, add the message as `queued` and don't emit at all. The queue is just "every message with status `queued` or `failed`, oldest first". You don't need a separate data structure.

Also check `socket.connected` right before each emit. If it's false, queue instead. That keeps socket.io's buffer empty, so there's never a second, hidden copy of your queue.

Check it: set devtools throttling to Offline (or stop the server) and send three messages. They show "Queued", and the WS panel shows no `message:send` frames.

### Step 3: Write the reconnect sequence, in order

The order of these steps matters. Write it down before coding it:

```text
on connect (every time, not just the first):
    1. emit channel:join for every channel in the sidebar
         (await each ack: you're in the rooms again, and presence is rebuilt)
    2. for each channel: GET /api/channels/:id/messages?after=<highest confirmed id>
         repeat while hasMore, adding everything through messageReceived
    3. for each queued message, oldest first:
         emit message:send with its original tempId, await the ack
         stop if one fails, and leave the rest queued
    4. set connection = connected and hide the banner
```

Why join before fetching? If you fetched first, a message sent between your fetch and your join would be missed forever. Joining first means a message might arrive both by broadcast and in the fetch, which your de-duplication by id already handles. Prefer overlap you can de-duplicate over a gap you can't see.

Why one at a time? Sending three messages in parallel lets the server save them in any order. Awaiting each ack keeps your order.

Check it: log each step with a timestamp. After a reconnect, the log always reads join, fetch, flush, in that order.

### Step 4: Add the catch-up endpoint

Extend the history endpoint from the [persist messages milestone](/development/realtime-collab/persist-messages) to accept `after=<id>`. It returns messages with a larger id, oldest first, capped at your page size, plus `hasMore`. It's the mirror of `before`.

```bash
curl "http://localhost:3000/api/channels/1/messages?after=1042&limit=50"
```

Check it: go offline in window A. In window B, paste 120 messages with a quick script. Go back online in A. A ends up with all 120, in order, with no gaps. Compare the last id in both windows.

### Step 5: Survive a refresh while offline

Save queued messages to `localStorage` whenever the queue changes, under a key that includes the user id. Load them back on startup, and run them through the same flush as step 3 once the socket connects. Keep the `tempId` in what you save: if a message was actually saved by the server before the refresh, the retry is still idempotent.

Wrap `localStorage` reads and writes in `try/catch`. They can throw in private windows or when storage is full.

Check it: stop only the Node server (Vite keeps serving the page), send two messages, and refresh. The page loads with both still shown as "Queued". Start the server again: both send, once each.

### Step 6: Break it on purpose, repeatedly

Spend twenty minutes breaking your own app, with two windows side by side, checking both after each of these:

- Devtools Offline, on and off, five times in a row, sending during each offline spell.
- Kill the server (Ctrl+C) while a message is in "sending", then start it again.
- Restart the server with three clients connected. Watch them all reconnect, and check presence.
- On your phone, open the deployed app (or your laptop's LAN address) and switch to airplane mode mid-send.
- Use `DEV_SLOW_SAVE_MS` from the optimistic UI milestone together with offline mode.

Check it: after every scenario, both windows show the same messages, in the same order, each once.

## Common mistakes

- **Reconnecting without catching up.** Symptom: messages sent while you were away just never appear, and users report "sometimes I miss messages." Fix: fetch everything after your highest confirmed id on every reconnect.
- **Catching up with only the last 50.** Symptom: after a long time away, there's a silent hole in the middle of history. Fix: page with `after` until `hasMore` is false.
- **Letting socket.io's buffer hold sends.** Symptom: messages show "Failed" while offline, then appear as sent anyway on reconnect, sometimes twice. Fix: check `socket.connected` and queue in your own state instead.
- **Flushing the queue in parallel.** Symptom: "Wait" arrives before "hi, are you free?". Fix: send one at a time and await each ack.
- **Running reconnect logic only on the first connect.** Symptom: the first blip works, and every later one breaks presence and history. Fix: the `connect` handler runs the full sequence every time.

## Say it in the interview

"Reconnection is a protocol, not an event handler. On every connect, the client re-joins its channels, fetches everything after the highest message id it has, then sends its offline queue one message at a time, reusing each message's tempId so retries are idempotent. I join before fetching because overlap can be de-duplicated by id, but a gap is invisible. One honest limitation: Postgres can hand out ids in a different order from the one transactions commit in, so under heavy concurrency an `after` query could skip a message that commits late. At my scale that window is tiny, and the fix would be a per-channel sequence assigned inside a lock."

## Stretch goals

- Show "3 new messages" instead of auto-scrolling when catch-up adds messages while the user is scrolled up.
