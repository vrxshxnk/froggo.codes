---
id: rate-limit-abuse
project: realtime-collab
title: Rate limiting and abuse protection
summary: >-
  Replace the dev user picker with real sign-in, verify the same token on every HTTP request and every socket handshake, then limit each user to about 10 messages per 10 seconds and cap message size on the server.
time: 4-5 hours
doneWhen:
  - A socket connecting with no token, a wrong token or an expired token gets connect_error and never joins a room
  - Changing the userId in the client no longer lets you speak as someone else
  - The history and catch-up endpoints return 401 without a valid token
  - A script that sends 100 messages in a second gets about 10 through, and the rest are acked with rate_limited
  - A 50,000-character message is rejected by the server, even with the client's length check removed
docs:
  - label: "socket.io: Middlewares"
    url: https://socket.io/docs/v4/middlewares/
  - label: "socket.io: Server options (maxHttpBufferSize)"
    url: https://socket.io/docs/v4/server-options/
  - label: "JWT introduction"
    url: https://jwt.io/introduction
  - label: "zod documentation"
    url: https://zod.dev
  - label: "Express: Behind proxies"
    url: https://expressjs.com/en/guide/behind-proxies.html
---

## What you're building

Huddle stops trusting its clients. Users sign in with a password and get a signed token, which goes with every API `fetch` and in the socket handshake. A socket without a valid token is refused before it joins anything, and identity comes only from the verified token, never the payload. Each user can also send about 10 messages per 10 seconds: a flooding script gets clear rejections, and normal users never notice.

## Why it matters

A socket server that accepts anyone is a free, anonymous write path into your database. Students often secure their HTTP routes and forget the socket is a second front door. Authenticating the handshake with the same token, authorizing every action and limiting per user shows an interviewer you think like an attacker.

## Before you start

- **JWT.** A JSON Web Token is a small signed string holding claims such as `{ sub: userId, exp: ... }`. Your server signs it with a secret using the `jsonwebtoken` package (`jwt.sign(claims, secret, { expiresIn: "1h" })`) and checks it with `jwt.verify(token, secret)`, which throws if the signature is wrong or the token has expired. Anyone can read its contents, so keep secrets out.
- **socket.io middleware.** `io.use((socket, next) => ...)` runs once per connection, before the `connection` event. Calling `next(new Error("unauthorized"))` refuses the connection, and the client receives a `connect_error` event with that message.
- **Token bucket.** Each user's bucket holds up to 10 tokens and refills at 1 per second, and each message spends one. It allows short bursts but caps the long-run rate, which suits chat.
- **Authentication and authorization.** Authentication is who you are (the token answers it). Authorization is whether you may do this particular thing, like posting in this channel. Every event needs both.

## Build it step by step

### Step 1: Add real sign-up and sign-in

Add a `password_hash` column to `users`, and two routes, `POST /api/signup` and `POST /api/login`. Hash passwords with `bcrypt` (never store them as plain text), and on success return a JWT whose `sub` claim is the user id, with an expiry of an hour or so. Validate both request bodies with zod. Use one error message for a wrong username or password, so login can't reveal which usernames exist.

Delete the dev user picker. The client keeps the token in `localStorage` after login and sends it as `Authorization: Bearer <token>` on every API call.

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ana","password":"<the password you seeded>"}'
```

Check it: that command returns a token. Decode its middle part in Node with `Buffer.from(part, "base64url").toString()`: you should see your user id and an `exp` timestamp, and no password.

### Step 2: One verify function, used in two places

Write a single `verifyToken(token)` function that returns the user or throws. Use it in an Express middleware that protects every `/api` route except signup and login, and in an `io.use` middleware that reads `socket.handshake.auth.token`. The socket middleware sets `socket.data.userId` from the verified token. Delete every line that reads a user id from `handshake.auth` or from an event payload.

On the client, pass the token with `io({ auth: { token } })`. On `connect_error` with `unauthorized`, send the user to the login screen instead of letting socket.io retry forever.

Check it: in the browser console, create a second client with a garbage token. It gets `connect_error`, and the server logs no `connection` event. Then `curl` the history endpoint with no header and get a 401.

### Step 3: Authorize every event

For each handler, write down what the user must be allowed to do. They must be in a channel's room to `typing:start` there, the channel must exist for `channel:join`, and the author is always `socket.data.userId`, whatever the payload claims.

Validate every payload with a zod schema before using it. The schema is where you cap message length, for example a trimmed body of 1 to 2,000 characters. Also set the server's `maxHttpBufferSize` option to something modest, so a single frame of several megabytes is dropped before your handler ever sees it.

Check it: from the console, emit `message:send` with a 50,000-character body and with a channel id you never joined. Both get an error ack, and neither creates a row.

### Step 4: Rate-limit per user with a token bucket

Keep a `Map` from user id to `{ tokens, updatedAt }`. Key it by user, not by socket: someone with three tabs would otherwise get three times the limit. Refill lazily when a message arrives, rather than on a timer:

```text
on message:send from userId:
    b = buckets[userId] or { tokens: 10, updatedAt: now }
    b.tokens = min(10, b.tokens + (now - b.updatedAt) / 1000 * 1)
    b.updatedAt = now
    if b.tokens < 1: ack { ok: false, error: "rate_limited", retryAfterMs }
    else: b.tokens -= 1, continue
```

Work out `retryAfterMs` from the refill rate. Your optimistic UI already shows failed messages with Retry, so it just needs a friendly label. Give `typing:start` and `channel:read` their own looser buckets: they're cheap, but still worth capping.

Check it: write a small Node script with `socket.io-client`, signed in as a test user, that emits 100 sends as fast as it can. Count the acks: about 10 succeed and the rest say `rate_limited`. Wait 10 seconds and send again: it works.

### Step 5: Limit connections and clean up buckets

Cap sockets per user, say at 10, in the `io.use` middleware, and refuse the next one with a clear error. Remove a user's bucket when their last socket disconnects and their bucket is full again, or once an hour, so the map doesn't keep every user who ever connected.

If you deploy behind a proxy and limit by IP anywhere, set Express's `trust proxy` setting, or every request will seem to come from the proxy's address.

Check it: open 11 tabs as one user. The 11th shows a "too many connections" message instead of silently failing.

### Step 6: Handle token expiry on a long-lived socket

A token is checked once, at the handshake, but a socket can stay open for hours after the token expires. Decide your rule and write it in the README. A simple, defensible one: store the token's `exp` in `socket.data`, and in each command handler, if it has passed, ack `unauthorized` and disconnect the socket. The client then refreshes its token or sends the user to sign in.

Check it: set the expiry to one minute with an env variable, connect, wait two minutes, and send. You're asked to sign in again.

## Common mistakes

- **Trusting the user id in the payload.** Symptom: changing one field in the console lets you post as anyone. Fix: identity comes only from `socket.data.userId`, set by the middleware.
- **Rate-limiting per socket.** Symptom: opening more tabs multiplies your limit. Fix: key buckets by user id.
- **Checking length only in the browser.** Symptom: a script posts a huge message that breaks everyone's layout. Fix: the zod schema on the server is the real limit, and the client's check is only a courtesy.
- **Relying on the CORS origin setting for security.** Symptom: you feel safe because browsers on other sites are blocked, but a Node script connects anyway. Fix: CORS only limits browsers. Authentication is what stops scripts.

## Say it in the interview

"The socket handshake is verified with the same JWT as the HTTP API, through one shared verify function, and the server takes identity only from the verified token. Every event is validated with zod and authorized separately. Sends are limited per user with a token bucket of 10 tokens refilling at one a second, which allows quick bursts but stops floods, and it's keyed by user so extra tabs don't help. The tradeoff is that the buckets live in memory, so they reset on restart and wouldn't be shared across servers. Moving them to Redis would fix both."

## Stretch goals

- Store the token in an `httpOnly` cookie instead of `localStorage`, and explain what that protects against and what it doesn't.
