---
id: typing-receipts
project: realtime-collab
title: Typing indicators and read receipts
summary: >-
  Show "Ravi is typing..." that clears itself even when Ravi's laptop dies mid-word, and "Seen by Ana" receipts stored as one last-read message id per user per channel.
time: 3-4 hours
doneWhen:
  - Typing in one window shows an indicator in the other within a moment
  - Killing the typing window's tab, or setting it offline, clears the indicator in about 3 seconds with no stop event
  - Holding a key down for 20 seconds sends a few typing:start events, not hundreds
  - Reading a channel updates one row in channel_members, and the other window shows "Seen by" under the right message
  - Unread counts in the sidebar come from last_read_message_id, and survive a refresh
docs:
  - label: "Node.js: Timers"
    url: https://nodejs.org/api/timers.html
  - label: "MDN: Document.visibilityState"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
  - label: "MDN: Intersection Observer API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  - label: "PostgreSQL: INSERT ... ON CONFLICT"
    url: https://www.postgresql.org/docs/current/sql-insert.html
---

## What you're building

Two small features that make chat feel alive. When Ravi types in #general, everyone else in the channel sees "Ravi is typing..." under the message list. It disappears a few seconds after he stops, when he sends, or when his laptop lid closes, even though a closed laptop sends nothing at all. Under the latest messages, small labels show "Seen by Ana, Priya" for each message that's someone's last read, and the sidebar shows unread counts per channel.

## Why it matters

Typing indicators teach a rule worth keeping: absence of a signal must be safe. A "stop" event is a promise from a machine that may vanish first, so the server sets its own expiry. Read receipts teach storage shape: one id per user per channel carries the same information as a "read" flag on every message, with a tiny fraction of the rows. Interviewers like both design calls.

## Before you start

- **Server-side timers.** `setTimeout` returns a handle you can pass to `clearTimeout`. If you keep handles in a `Map`, you can refresh a timer by clearing it and setting a new one. Every timer you create must eventually be cleared or fire, or it holds memory.
- **Throttling.** Limiting how often something happens, for example at most one `typing:start` every 2 seconds however fast the user types. It's different from debouncing, which waits until the activity stops.
- **Monotonic updates.** A value that only moves forward. Read state should never go backwards: if an old "read up to 90" arrives after "read up to 120," the 120 must win. In SQL, `GREATEST(old, new)` does that.
- **Page visibility.** `document.visibilityState` is `"visible"` only when the tab is in front. A message on screen in a background tab hasn't been read.

## Build it step by step

### Step 1: Add the typing events to your protocol

Update your protocol table first. The client sends `typing:start { channelId }` and optionally `typing:stop`. The server sends `typing:update { channelId, userId, isTyping }` to the rest of the room. Note that `typing:stop` is a courtesy the server must not depend on.

Check it: your table says what clears the indicator in each of these cases: the user sends, stops typing, closes the tab, or loses the network.

### Step 2: Throttle on the client

On the message input's `input` event, emit `typing:start` if you haven't sent one in the last 2 seconds. Keep that timestamp in a ref, not in state, because it isn't something you render. When the user sends the message or clears the input, emit `typing:stop` and reset the timestamp.

Check it: hold a key down for 20 seconds while watching the WS panel. You should see roughly ten `typing:start` frames, not a flood.

### Step 3: Expire on the server

Keep a `Map` keyed by `channelId:userId`, holding a timer handle. On `typing:start`, if there's no entry, broadcast `typing:update` with `isTyping: true` using `socket.to(room)`. Either way, clear any existing timer and set a new one for 3 seconds. When it fires, delete the entry and broadcast `isTyping: false`.

```text
on typing:start(channelId):
    key = channelId + ":" + userId
    if key not in timers: broadcast isTyping true
    clearTimeout(timers[key]) if present
    timers[key] = setTimeout(3000, () => delete key; broadcast isTyping false)
```

Because the client refreshes every 2 seconds and the server expires after 3, a typing user never flickers off. `typing:stop` and a successful `message:send` both clear the entry early. When a user's last socket disconnects, clear all their typing timers too, or they pile up in the map.

Check it: start typing in window A, then close that tab abruptly. Window B's indicator disappears about 3 seconds later. Repeat with devtools set to offline in window A instead of closing it.

### Step 4: Show it well on the client

Keep a set of typing user ids per channel, minus your own id (your other tabs hear about you). Render "Ravi is typing...", "Ravi and Ana are typing..." or "Several people are typing..." for three or more. Reserve the line's height when empty so the list doesn't jump.

Check it: three users type at once, and the text reads correctly at every count from zero to three.

### Step 5: Store read state as one id per user per channel

Add `last_read_message_id` (bigint, nullable) to `channel_members`, whose primary key is `(user_id, channel_id)`. Create the row the first time a user joins a channel, if it isn't there yet. Marking read is a single upsert: insert the row, or on conflict set `last_read_message_id` to the greater of the stored value and the new one.

Compare a `message_reads` table with a row per user per message: 50 people and 10,000 messages is up to 500,000 rows, and each new message means 50 more writes. With one id, a message is read by a user if its id is at most their `last_read_message_id`.

Check it: mark read twice, with ids 120 and then 90. The row still says 120.

### Step 6: Decide when something counts as read

Add a `channel:read { channelId, lastReadMessageId }` command. Send it when the newest message becomes visible on screen (an `IntersectionObserver` on the last message) and `document.visibilityState` is `"visible"`. Throttle it to about once a second, since scrolling can fire it repeatedly. When the tab comes back into view, check again.

On the server, apply the upsert, then broadcast `receipt:update { channelId, userId, lastReadMessageId }` to the room. Add each member's last-read id to the `channel:join` ack, so a fresh client can draw receipts straight away.

Check it: with window B's tab in the background, send from A. B's receipt doesn't move until you switch to B's tab.

### Step 7: Render receipts and unread counts

For each other member, find the message whose id equals their last-read id, and render their name or avatar under it. That way each person appears once, at the furthest point they've read. For the sidebar, count messages with an id greater than your last-read id for each channel. You can return these counts from a `GET /api/channels` request, as a `count(*)` grouped by channel.

Check it: refresh window B. The unread count and receipts are the same as before the refresh.

## Common mistakes

- **Trusting `typing:stop`.** Symptom: "Ana is typing..." stays forever after Ana closes her laptop. Fix: the server expires it after 3 seconds, and stop is only an early exit.
- **Emitting on every keystroke.** Symptom: hundreds of frames a minute per typist, and the server's timer map churns. Fix: throttle on the client to one event every 2 seconds.
- **Letting read state go backwards.** Symptom: receipts jump back up the channel when two tabs report at different times. Fix: update with `GREATEST`, and ignore smaller ids on the client too.
- **Marking read in a background tab.** Symptom: "Seen by Ravi" appears while Ravi is on another tab, so receipts lie. Fix: check `document.visibilityState` before sending `channel:read`.
- **Never clearing typing timers on disconnect.** Symptom: the map grows with every user who ever typed and left mid-word. Fix: when a user's last socket goes, clear their timers and delete their keys.

## Say it in the interview

"For typing, I don't trust the stop event, because a closed laptop never sends it. A start event sets a 3-second server timer, the client refreshes it every 2 seconds while typing, and the indicator clears itself however the client dies. Read receipts are one last-read message id per user per channel, updated with GREATEST so they never move backwards. That's one row per membership instead of one per message per reader. The tradeoff is that you can't record reading a single old message out of order, which chat users don't expect anyway."

## Stretch goals

- Add a "New messages" divider at the user's last-read position when they open a channel.
- Show the exact time each person read a message on hover, by storing `updated_at` alongside the id.
