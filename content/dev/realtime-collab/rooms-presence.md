---
id: rooms-presence
project: realtime-collab
title: Implement channels and live presence
summary: >-
  Let users join channels and see who is online in each one, live. The core idea: a user is not a socket, because one person with three tabs open is three connections.
time: 4-5 hours
doneWhen:
  - Joining a channel puts your socket in that channel's room and returns the full online list in the ack
  - Opening a second tab as the same user does not show you twice, and closing one of two tabs keeps you online
  - Closing your last tab makes you disappear from everyone else's list within a couple of seconds
  - After the first join, the server sends only joined and left diffs, never the whole list
  - Restarting the server empties presence, and it rebuilds itself as clients reconnect
docs:
  - label: "socket.io: Rooms"
    url: https://socket.io/docs/v4/rooms/
  - label: "socket.io: The Socket instance (server)"
    url: https://socket.io/docs/v4/server-socket-instance/
  - label: "socket.io: Handshake auth (client options)"
    url: https://socket.io/docs/v4/client-options/
  - label: "MDN: Map"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
---

## What you're building

A sidebar of channels, and inside each channel a live "online now" list. Open the app as Ana in one window and as Ravi in another: each sees the other appear the moment they join #general, and disappear when they close the app. Open a second tab as Ana and nothing changes for Ravi, because Ana was already online. Close one of Ana's tabs and she stays online. Close both and she's gone.

There's no messaging yet: this milestone is about who is connected where.

## Why it matters

One logical identity, many physical connections, is a pattern all over distributed systems: phones, laptops, tabs and retries all create extra connections for one user. Getting presence right shows you can model that, and separates durable state (channel membership, in the database) from ephemeral state (who is connected now, in memory and rebuilt after a restart).

## Before you start

- **Handshake auth.** When the client connects with `io({ auth: { userId } })`, the server reads it as `socket.handshake.auth`. For now, the server trusts whatever `userId` arrives. That's a deliberate hole you close in the [rate limiting and abuse milestone](/development/realtime-collab/rate-limit-abuse).
- **`socket.data`.** A per-socket object where you can store things like the user's id and name after the handshake, so every handler can read `socket.data.userId`.
- **`disconnecting` and `disconnect`.** Both fire when a socket goes away, but only during `disconnecting` does `socket.rooms` still list its rooms. Tracking rooms yourself avoids depending on that.
- **Heartbeats.** A closed tab usually disconnects at once. A laptop that loses power sends nothing, so socket.io notices only when its heartbeat ping goes unanswered, which can take about 45 seconds with default settings. That's normal.

## Build it step by step

### Step 1: Seed users and channels, and add a dev user picker

Create `users` and `channels` tables in Postgres (`id`, `name`, and for users a `display_name`), and a seed script with four or five users and three channels. You'll add the `messages` table in the next milestone. On the client, build a dev-only screen that lists the seeded users. Picking one stores the id in `localStorage` and connects the socket with that id in `auth`.

To be several people at once, use a normal Chrome window, an incognito window and Firefox: each has its own `localStorage`.

Check it: log `socket.handshake.auth` on `connection`. Each window logs a different user.

### Step 2: Design the presence map

Sketch the in-memory structure first. It must answer two questions fast: "who is online in channel X?" and "which channels was socket S in?"

```text
presence:      channelId -> Map( userId -> Set(socketId) )
socketRooms:   socketId  -> Set(channelId)
```

A user is online in a channel if their set of sockets there has at least one entry. That is the whole three-tabs fix. Put this in its own module (`server/presence.js`) with a few small functions, such as `addSocket`, `removeSocket` and `onlineUsers`, that return whether the user's status actually changed.

Check it: write the transitions in a comment. Adding a socket is "user came online" only when the set goes from 0 to 1, and removing one is "user went offline" only when it goes from 1 to 0.

### Step 3: Handle channel:join and channel:leave

On `channel:join`, check that the channel exists, call `socket.join()` with a room name like `channel:<id>`, and update the presence map. If the user's count went from 0 to 1, broadcast `presence:join` with the user to everyone else in the room using `socket.to(room).emit(...)`. Then reply through the ack with the full online list. `channel:leave` is the mirror image.

Have the client join every channel in its sidebar after connecting, not just the one on screen, so unread counts work later.

Check it: Ana joins, then Ravi joins. Ravi's ack lists Ana. Ana's window receives one `presence:join` for Ravi in the WS panel.

### Step 4: Broadcast diffs, not lists

Don't send the full list to everyone on every change. With 50 people in a channel, each join would send 50 names to 50 people: traffic grows with the square of the room size. Send the full list once, in the join ack. After that, send only `presence:join` and `presence:leave`, and let the client apply them to its own copy.

On the client, keep a set of online user ids per channel. `presence:join` adds one and `presence:leave` removes one, and adding someone already there does nothing.

Check it: watch the WS panel while three users join. After each one's first join, all you should see is small diff frames, never a growing array.

### Step 5: Clean up on disconnect

On `disconnect`, look up the socket's channels in `socketRooms`, remove the socket from each one in the presence map, and broadcast `presence:leave` wherever the user's count hit zero. Then delete the socket's entry from `socketRooms`, and delete empty inner maps and sets as well.

Entries left behind for every socket that ever connected are a slow memory leak, the kind you'll hunt in the [load test milestone](/development/realtime-collab/socket-load-test).

Check it: as Ana, open two tabs and close one. Ravi still sees her. Close the other, and she disappears from Ravi's list within a second or two.

### Step 6: Test the failure cases on purpose

Try each of these and note what happens:

- Stop the server with Ctrl+C. Every client disconnects. Start it again: socket.io reconnects on its own, but presence is empty until clients re-join. Make your client re-emit `channel:join` for its channels on every `connect` event, not just the first.
- In one window, set devtools Network throttling to **Offline**. If the open socket keeps working, your browser isn't applying throttling to it. Use `socket.io.engine.close()` from the console instead (expose the socket on `window` in dev builds), which drops the connection and lets it reconnect.
- Kill a tab from the browser's task manager. The other window should update once the heartbeat notices.

Check it: after a server restart, both windows show each other online again without a refresh.

## Common mistakes

- **Keying presence by socket id.** Symptom: Ana appears three times, and closing one tab marks her offline while two are still open. Fix: map users to a set of socket ids, and change status only on the 0-to-1 and 1-to-0 transitions.
- **Re-joining only on the first connect.** Symptom: after any blip or server restart, the user stops getting events and presence is wrong, but the socket says it's connected. Fix: rooms belong to the old socket. Re-join channels in the `connect` handler, which fires on every reconnect.
- **Registering listeners inside a React effect without cleanup.** Symptom: every presence event is applied twice in development. Fix: return a cleanup that calls `socket.off(event, handler)`.
- **Never deleting empty entries.** Symptom: memory creeps up over hours even with few users online. Fix: delete the inner set when it's empty, and the channel map when that's empty.
- **Using `io.to(room)` for presence diffs.** Symptom: you receive your own `presence:join`, and your list flickers. Fix: `socket.to(room)` excludes the sender's socket.

## Say it in the interview

"Presence is a two-level map in memory: channel to user to a set of socket ids. A user is online if they have at least one socket, which handles multiple tabs and devices. I send the full list once on join and diffs afterwards, because full-list broadcasts grow with the square of the room size. The tradeoff is that presence lives in one process's memory, so a restart wipes it. Clients rebuild it by re-joining when they reconnect, and to run more than one server I'd move it to Redis."

## Stretch goals

- Show "last seen 5 minutes ago" for offline members by writing a timestamp to the database when a user's last socket closes.
- Add an "away" state using `document.visibilityState`, sent as a presence update when the tab is hidden for more than a minute.
