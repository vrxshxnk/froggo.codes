---
id: socket-load-test
project: realtime-collab
title: Load test the socket layer
summary: >-
  Simulate a few hundred clients joining channels and chatting with Artillery, measure memory and event-loop lag while they do, and find the leak that makes memory climb after they've all gone.
time: 3-4 hours
doneWhen:
  - Your server reports connected sockets, heap used and p99 event-loop delay every few seconds
  - An Artillery run ramps to at least 300 concurrent authenticated clients that join, chat and disconnect
  - You've run three connect-chat-disconnect cycles and compared heap use after each one
  - You found at least one leak (or proved there isn't one with heap snapshots), fixed it, and re-ran to show the fix
  - Your README has a table of clients, p99 event-loop delay, peak heap and heap after the run, before and after the fix
docs:
  - label: "Artillery: Socket.IO engine"
    url: https://www.artillery.io/docs/reference/engines/socketio
  - label: "socket.io: Load testing"
    url: https://socket.io/docs/v4/load-testing/
  - label: "Node.js: perf_hooks.monitorEventLoopDelay()"
    url: https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions
  - label: "Node.js: process.memoryUsage()"
    url: https://nodejs.org/api/process.html#processmemoryusage
  - label: "Chrome DevTools: Heap snapshots"
    url: https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots
---

## What you're building

A repeatable load test and its numbers. One command starts a few hundred fake users who sign in, join channels, chat and leave. Meanwhile your server prints connected sockets, heap use and event-loop delay every five seconds. When the test ends every socket is gone, so memory should come back down. Usually it doesn't, and your job is to find out why.

## Why it matters

Any chat works with two tabs. Companies care about three hundred, and whether it's still healthy after a day of people coming and going. Long-running servers expose bugs request-response code never does, because leftover state accumulates instead of vanishing when a request ends. A leak found with real measurements, with before-and-after numbers, beats an unsupported "it scales".

## Before you start

- **Event-loop delay.** Node runs your JavaScript on one thread, so slow synchronous work in one handler makes every socket wait. `monitorEventLoopDelay()` from `perf_hooks` measures how late the loop runs, as a histogram in nanoseconds. Its p99 (the value 99% of samples are under) is a good health number.
- **Heap used.** `process.memoryUsage().heapUsed` is memory held by JavaScript objects. It swings as garbage collection runs, so compare it at quiet moments. Starting Node with `--expose-gc` lets you call `global.gc()` before measuring, which makes before-and-after comparisons fair.
- **What leaks in a socket server.** Anything long-lived that keeps a reference to something per-connection. Listeners on the socket itself are freed along with the socket. But a listener added to a shared emitter, a `setInterval` that's never cleared, or a `Map` entry that's never deleted lives forever and keeps everything it references alive too.
- **Why Artillery.** k6 and Artillery are both good load-testing tools. k6's WebSocket support speaks raw WebSocket, so with socket.io you'd have to encode socket.io's packet format by hand. Artillery's socket.io engine speaks it natively. If you built on native `ws`, k6 is a fine choice.

## Build it step by step

### Step 1: Make the server report its own health

Add a dev and staging-only stats logger. Every 5 seconds, print the number of connected sockets (`io.engine.clientsCount`), `heapUsed` in MB, the event-loop delay p99 in milliseconds (divide nanoseconds by 1e6, then reset the histogram), and the sizes of your own maps: presence, typing timers and rate-limit buckets. Those map sizes will point straight at most leaks.

```text
[stats] sockets=312 heapMB=88.4 loopP99ms=14.2 presenceUsers=300 typingTimers=41 buckets=300
```

Check it: open two tabs and watch `sockets` go from 0 to 2 and back to 0 when you close them.

### Step 2: Create test users and tokens

Load-test users need real tokens too. Don't add a bypass. Write a seed script that creates 500 users (`loadtest_1` to `loadtest_500`), signs a token for each, and writes them to a CSV file with a `token` column. Keep the file out of git.

Check it: the CSV has 500 rows, and one of its tokens works with your history endpoint via `curl`.

### Step 3: Write the Artillery scenario

Install Artillery (`npm install -D artillery`) and create `load/chat.yml`. Describe one virtual user's life, and Artillery starts many. Here it is in words. The exact YAML keys are in Artillery's socket.io engine docs, including how to pass the token in the handshake for your version.

```text
config:   target = your local server, payload = the tokens CSV
phases:   ramp from 5 to 50 new users per second over 60 seconds,
          then hold for 120 seconds
each virtual user:
    connect with auth.token = a row from the CSV
    emit channel:join for #general and one random channel
    loop 10 times: emit message:send (unique tempId), think 3-5 seconds
    emit typing:start once or twice along the way
    disconnect
```

Run it with `npx artillery run load/chat.yml`. Start with 10 users to check the scenario works. Ten messages over 30 seconds stays well under your rate limit.

Check it: with 10 users, your stats line shows 10 sockets, the messages are in `psql`, and Artillery reports no errors.

### Step 4: Run the real test and record a baseline

Raise the phases until you reach at least 300 concurrent clients. Before you do, run `ulimit -n` in the terminal running Artillery: on macOS it's often 256, and every socket needs a file descriptor. Raise it for that session with `ulimit -n 4096`, or you'll see `EMFILE` errors that look like server failures but aren't.

Record, for the whole run, the peak sockets, the peak `heapMB`, the worst `loopP99ms`, and Artillery's summary of errors and response times. Note that the load generator and server share one laptop's CPU.

Check it: your stats line shows at least 300 sockets at the peak, and you have the numbers written down.

### Step 5: Look for the leak with three cycles

Run the test three times in a row without restarting the server. After each run, wait 30 seconds, call `global.gc()`, and write down `heapMB` and every map size. Sockets are back to 0 every time. If `heapMB` or a map size climbs with each cycle, you have a leak. A typical result is roughly 40 MB, then 55, then 70, with `presenceUsers` or `buckets` never returning to 0.

Map sizes catch the easy leaks. For the rest, start the server with `node --inspect --expose-gc`, open `chrome://inspect`, and in the Memory tab take a heap snapshot after cycle 1 and another after cycle 3. Switch the second one to the **Comparison** view and sort by the number of new objects. Look for things that should have died along with the sockets, such as `Socket`, `Timeout` and your own closures.

Check it: you can name the object type that keeps growing and the line of code that creates it.

### Step 6: Fix it and prove the fix

Common culprits in this project, in rough order of how often they show up:

- A listener added to a shared emitter (a DB client, `process` or `io`) inside the `connection` handler, and never removed
- A per-socket `setInterval` for something like a heartbeat or cleanup, with no `clearInterval` on disconnect
- Presence inner maps and sets that are emptied but never deleted
- Typing timers for users who disconnected while typing
- Rate-limit buckets that are never evicted

Node sometimes helps: a `MaxListenersExceededWarning: Possible EventEmitter memory leak detected` in your logs means more than 10 listeners were added to one emitter, which in a socket server usually means one per connection. Fix the cause, then run the same three cycles again and put both sets of numbers in your README.

Check it: after the fix, heap after each cycle is flat (give or take a few MB) and every map returns to 0.

## Common mistakes

- **Measuring heap at the peak.** Symptom: numbers jump around and prove nothing. Fix: compare after each run, once things are quiet, after `global.gc()`.
- **Adding an auth bypass for the test.** Symptom: you test a code path production never runs, and the bypass might ship. Fix: real users and real tokens from a seed script.
- **Blaming the server for client-side limits.** Symptom: `EMFILE` or connection errors at around 250 users. Fix: check `ulimit -n` on the machine running Artillery.
- **Doing slow synchronous work in a handler.** Symptom: loop delay p99 climbs into hundreds of milliseconds, and every user's messages lag. Fix: find the culprit (often a large `JSON.stringify` or logging every event to the console) and remove it from the hot path.

## Say it in the interview

"I load-tested with Artillery's socket.io engine: X clients with real tokens joining and chatting, while the server logged sockets, heap and p99 event-loop delay. Running three cycles back to back showed heap climbing by about Y MB per cycle with zero sockets connected. A heap snapshot comparison pointed to a listener I added to a shared emitter on every connection and never removed. After the fix, heap was flat across cycles. The tradeoff is that I tested on one laptop, so the absolute numbers are rough, but the leak and the trend are real."

## Stretch goals

- Add a scenario where every client disconnects and reconnects at once, like after a deploy, and measure how long the server takes to settle.
