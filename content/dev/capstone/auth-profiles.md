---
id: auth-profiles
project: capstone
title: Auth, profiles, and the follow graph
summary: >-
  Add sign-up and sessions, public profiles, and a follows table indexed for both "who do I follow?" and "who follows me?". Follower counts are cached columns, so a profile view never runs COUNT(*). Then seed 10,000 users with a realistic, skewed follow graph.
time: 8-10 hours
doneWhen:
  - You can sign up, sign out and sign back in, and the session cookie is `HttpOnly` and `SameSite=Lax`
  - Following the same user twice leaves exactly one row and adds one to the count, not two
  - "`EXPLAIN` for both the following list and the followers list shows an index scan, not a sequential scan"
  - Loading a profile runs no `COUNT(*)` (check the query log), and its counts match a manual count
  - The seed script creates 10,000 users, and the most-followed account has thousands of followers while the median user has well under a hundred
docs:
  - label: "OWASP: Password Storage Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  - label: "OWASP: Session Management Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
  - label: "MDN: Set-Cookie"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
  - label: "PostgreSQL: INSERT and ON CONFLICT"
    url: https://www.postgresql.org/docs/current/sql-insert.html
  - label: "PostgreSQL: Set returning functions (generate_series)"
    url: https://www.postgresql.org/docs/current/functions-srf.html
---

## What you're building

People can create an account with a username and password, sign in, and stay signed in. Each user has a profile page at `/u/ana` showing their display name, bio, avatar and two numbers: followers and following. A Follow button on the page works instantly. Lists of followers and following scroll page by page.

Behind that is a database with 10,000 seeded users and a follow graph shaped like a real one: most people follow a few dozen accounts, and a handful of accounts are followed by thousands. Every later milestone, and especially the load test, runs against this data.

## Why it matters

The follow graph feeds the feed, so its indexes decide how fast the app's most important query can be. Cached counts are your first deliberate trade of perfect consistency for predictable latency: a number maintained on write may drift slightly, but a live count gets slower exactly for the most-viewed profiles. Large-scale design keeps coming back to that trade.

## Before you start

- **Sessions vs JWTs.** A session is a random token stored in a cookie. The server looks it up on each request, so signing someone out is instant. A JWT is a signed token the server can verify without a lookup, but it's hard to revoke before it expires. Ripple uses sessions. You already have Postgres and Redis, and instant revocation matters more than saving one lookup.
- **Password hashing.** Never store passwords, only a slow, salted hash. OWASP recommends Argon2id. The `argon2` npm package gives you `hash()` and `verify()`, and bcrypt is an acceptable fallback.
- **Composite primary key.** `PRIMARY KEY (follower_id, followee_id)` makes a duplicate follow impossible and doubles as an index sorted by follower. A second index on `(followee_id, follower_id)` serves the reverse direction.
- **Cursor pagination.** Instead of `OFFSET 400`, the client sends the last item it saw, and the query asks for rows after it. It stays fast on page 50, and rows don't repeat when new ones arrive.
- **Same-origin API calls.** If the browser talks to `web`, and Next.js forwards `/api/*` to the API server (with `rewrites` in `next.config`), cookies and CORS stay simple. The browser sees one origin.

## Build it step by step

### Step 1: Create the users and sessions tables

Write the Drizzle schema and generate a migration. `users.username` gets a unique index on its lowercased value, so `Ana` and `ana` can't both exist. Add `followers_count` and `following_count` as integer columns defaulting to 0.

Sessions store a **hash** of the token, never the token itself. If the table leaks, nobody can use the rows to sign in.

```json
{ "sessions": { "id": "sha256(token)", "user_id": "01J...", "expires_at": "2026-12-20T10:00:00Z", "created_at": "..." } }
```

Check it: `pnpm drizzle-kit migrate` runs cleanly against an empty database, and again in CI.

### Step 2: Sign up, sign in, sign out

Validate the body with the shared Zod schema. Hash the password with Argon2id. On sign-in, verify the hash, generate 32 random bytes as the token, store its SHA-256 and set the cookie: `HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`, with a sensible max age. Write one Express middleware that reads the cookie, looks up the session, and puts `req.user` on the request. Sign-out deletes the session row and clears the cookie.

Give one error for "no such user" and "wrong password", so nobody can probe which usernames exist.

Check it: sign in, copy the cookie, sign out, then replay the request with `curl -b "sid=<old token>" localhost:4000/me`. It must return 401.

### Step 3: Profiles

Add `GET /users/:username`, which returns the public fields and both counts straight from the row, and `PATCH /me` for display name and bio. Avatars wait for the [media pipeline](/development/capstone/media-pipeline). Use the same pipeline later, and leave the field null for now.

Check it: turn on query logging (Drizzle's `logger: true`, or `log_statement = 'all'` on your dev Postgres), load a profile, and confirm exactly one simple `SELECT` on `users`.

### Step 4: Follow and unfollow, with counts in the same transaction

`POST /users/:id/follow` does this inside one transaction:

```text
insert into follows (me, them) on conflict do nothing, returning the row
if a row came back:            # a new follow, not a repeat
    following_count += 1 for me
    followers_count += 1 for them
commit
```

Unfollow is the mirror image: `DELETE ... RETURNING`, and decrement only if a row was deleted. Add a `CHECK (follower_id <> followee_id)` constraint, so nobody can follow themselves.

Check it: send the same follow request five times in a row. There should be one row, and the count should go up by one.

### Step 5: Both directions of the graph, paginated

`GET /users/:id/following?cursor=` reads the primary key, and `GET /users/:id/followers?cursor=` reads the reverse index. Return 20 at a time with a `nextCursor`. The feed will run the "who do I follow?" query on every load, so look at its plan now.

```sql
EXPLAIN ANALYZE SELECT followee_id FROM follows WHERE follower_id = $1;
```

Check it: both plans show `Index Only Scan` or `Index Scan` on the right index once the seed data exists. A `Seq Scan` means the index is missing or the planner can't use it.

### Step 6: Seed a realistic graph

Write `scripts/seed.ts` (or a SQL file) that creates 10,000 users and a skewed follow graph. Doing it in SQL with `generate_series` takes seconds. Hashing 10,000 passwords one by one takes much longer, so give all seed users one precomputed hash of a known dev password.

```text
create users 1..10000 (username user_1 ... user_10000)
mark 20 users as popular; make popular_1 the biggest
for each user:
    follow k random users, where k is small for most users (5-80)
    with high probability also follow several popular accounts
recompute both counts with one UPDATE ... FROM (SELECT ... GROUP BY)
```

That final recount uses `COUNT(*)` once, in a batch job, which is fine. The rule is never to count on render.

Check it: the top 5 accounts by `followers_count` are in the thousands, and the median is in the tens.

### Step 7: Reconcile counts, and write the tradeoff into the doc

Counts can drift (a crashed transaction, a manual fix in SQL). Add a script, which becomes a scheduled worker job later, that recomputes counts for users whose stored value disagrees with the real one. In your design doc, add a "Counters" note covering three things. Counts are maintained on write in the same transaction as the follow. A reconcile job repairs drift. And the known cost: one very popular account being followed by many people at once makes its `users` row a hot spot, because every follow locks it briefly. Name the fix you'd reach for at higher scale. Buffer increments in Redis with `INCR` and flush them to Postgres periodically.

Check it: set one user's `followers_count` to 0 by hand, run the reconcile, and see it restored.

## Common mistakes

- **Counting on render.** Symptom: profile pages get slower as accounts grow, and the most popular profile is the slowest page on the site. Fix: read the cached column, and update it in the follow transaction.
- **Incrementing even when nothing was inserted.** Symptom: double-clicking Follow shows 2 new followers. Fix: only touch counts when `RETURNING` gave you a row.
- **Only indexing one direction.** Symptom: followers lists time out for popular accounts. Fix: add the `(followee_id, follower_id)` index.
- **Storing raw session tokens.** Symptom: none until a leak, and then every session is stolen at once. Fix: store a SHA-256 of the token and compare hashes.
- **Calling the API cross-origin without a plan.** Symptom: sign-in works, but the next request is anonymous, because the browser didn't send the cookie. Fix: proxy `/api` through Next.js rewrites, or send credentials and configure CORS with an explicit origin.

## Say it in the interview

"The follows table is a composite primary key on follower and followee, plus a reverse index, so both 'who do I follow' and 'who follows me' are index scans. The feed hits the first one on every load. Follower counts are columns updated in the same transaction as the follow, and only when a row was actually inserted, so repeated clicks are safe. The tradeoff is that counts can drift and a celebrity's row gets lock contention. I added a reconcile job, and noted that at higher scale I'd buffer increments in Redis."

## Stretch goals

- Add "Sign in with GitHub" via OAuth next to passwords, linking accounts by verified email.
