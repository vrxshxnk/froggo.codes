---
id: crud-api
project: fullstack-platform
title: Build the post CRUD API with server-side validation
summary: >-
  Build the endpoints that create, read, update and delete posts. Every write checks on the server who the caller is and whether they own the post, and every body is validated with Zod before it touches the database.
time: 5-6 hours
doneWhen:
  - "`curl -X POST` to `/api/posts` with no cookie returns 401, and no row is created"
  - A body with an empty title, or a 2 MB title, returns 400 with a message naming the field
  - Sending your own cookie with someone else's post id to `PATCH /api/posts/<id>` returns 404 and changes nothing
  - "Adding `\"authorId\": \"<another user's id>\"` to a create request has no effect: the post is still yours"
  - "With your cookie, `GET /api/posts/not-a-uuid` returns 404, not a 500"
docs:
  - label: "Next.js: route.js (Route Handlers)"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/route
  - label: "Next.js: Data security"
    url: https://nextjs.org/docs/app/guides/data-security
  - label: "Zod documentation"
    url: https://zod.dev
  - label: "OWASP: Authorization Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
  - label: "MDN: HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
---

## What you're building

A small JSON API for posts, which the editor will call in the next milestone:

```text
POST    /api/posts        create a draft          -> 201 { id, slug }
GET     /api/posts/:id    load one of my posts    -> 200 post | 404
PATCH   /api/posts/:id    update title/content... -> 200 post | 400 | 404
DELETE  /api/posts/:id    delete my post          -> 204 | 404
```

Each one works for its owner and refuses everyone else with the right status code. You'll test it the way an attacker would, with `curl`, because an attacker never uses your form.

Publishing (changing `status`) is deliberately not here. It gets its own endpoint in the [drafts milestone](/development/fullstack-platform/drafts-publish).

## Why it matters

Broken access control, where a user can act on data that isn't theirs, sits at the top of the OWASP Top 10, the best-known list of web security risks. It's usually one missing line: a handler that checks you're signed in but not that the post is yours. This milestone builds the habit that prevents it. "Walk me through what your API does when a request comes in" is a standard interview question, and a clear answer, in order, is what separates people who've built backends from people who've copied them.

## Before you start

- **Authentication vs authorisation.** Authentication asks who you are (the session from `auth()`). Authorisation asks whether you're allowed to do this (do you own post 42?). You need both on every write, and they're different checks.
- **Route Handlers.** A `route.ts` file exports functions named after HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`). Each receives the `Request`, plus `params` for dynamic segments like `[id]`. In current Next.js, `params` is a Promise, so you `await` it.
- **Zod.** A library where you describe the shape you expect (title is a string of 1 to 200 characters) and call `schema.safeParse(body)`. You get either clean, typed data or a list of issues. By default Zod drops keys you didn't declare, which matters below.
- **Mass assignment.** Copying the request body straight into a database update. If the body contains `authorId` or `status`, they get written too. The fix is to build the update only from validated, allowed fields.
- **Status codes.** 400 means bad input, 401 means not signed in, 403 means signed in but not allowed, 404 means not found. To a stranger, "not yours" should look like "doesn't exist", so you'll use 404 for that. See [MDN's status code list](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status).

## Build it step by step

### Step 1: Put every query in one data module

Create `src/data/posts.ts`, mark it server-only, and put every posts query in it: `createPost`, `getOwnPost`, `updateOwnPost`, `deleteOwnPost`. Route handlers stay thin. They check, validate and call these functions. The Next.js [data security guide](https://nextjs.org/docs/app/guides/data-security) calls this a data access layer. The payoff is one place to audit: if every function that writes takes the caller's id and uses it, you can see at a glance that nothing is unscoped.

Check it: no file under `app/` imports `db` directly. A quick search for your db import confirms it.

### Step 2: Write the validation schemas

Write one Zod schema per kind of request, in a file both the server and the editor can import. Decide the limits now and write them down:

```text
title         string, trimmed, 1-200 chars          (required on create)
content       string, 0-100,000 chars               (markdown source)
excerpt       string, 0-300 chars, optional
coverImageUrl URL on your bucket's host, optional   (used in the uploads milestone)
tags          array of 0-5 strings, each 1-30 chars, lowercased
```

The update schema is the same, but every field is optional (Zod's `.partial()`). Notice what's missing: `id`, `authorId`, `slug`, `status` and `publishedAt`. The server sets those, never the client.

Check it: in a quick script, `safeParse` a few bad bodies (an empty title, 6 tags, a number for content). Each fails with an issue that names the field.

### Step 3: Fix the order of checks in every handler

Every write handler runs the same five steps, in this order. Write the order as a comment at the top of the file and follow it every time.

```text
1. userId = requireUserId()           -> 401 if no session
2. body   = parse JSON                -> 400 if it isn't JSON
3. data   = schema.safeParse(body)    -> 400 with the issues if invalid
4. result = data-layer call scoped to userId
5. respond: 201 / 200 / 204, or 404 if no row matched
```

Authentication comes first, so strangers learn nothing, not even your validation rules. Validation comes before any query, so bad input never reaches the database.

Check it: `curl -i -X POST localhost:3000/api/posts -d '{}'` returns 401 before anything else happens.

### Step 4: Create posts, with the author from the session

`POST /api/posts` takes the validated data and calls `createPost(userId, data)`. The author is the `userId` from step 1, and nothing in the body can change it. Generate the slug on the server from the title, using your rule from the schema milestone, and let the unique constraint settle collisions: if Postgres raises `23505`, retry once with a short random suffix. New posts are always `draft`. Return 201 with the id and slug.

To test with a session, sign in in the browser, copy the `authjs.session-token` cookie value from DevTools, and send it:

```bash
curl -i -X POST localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=PASTE_HERE" \
  -d '{"title":"Hello","content":"First post","authorId":"someone-else"}'
```

Check it: the row exists, `author_id` is you, and `status` is `draft`.

### Step 5: Scope reads, updates and deletes to the owner

The safest ownership check is in the query itself. Don't load the post, compare the author in JavaScript, and then update. Put both conditions in one statement, so there's nothing to forget and no gap between the check and the write:

```text
UPDATE posts SET <validated fields>, updated_at = now()
WHERE id = :id AND author_id = :userId
RETURNING *
-- zero rows back -> respond 404
```

Do the same for `getOwnPost` and `deleteOwnPost`. Validate `:id` as a uuid first and return 404 if it isn't one, otherwise Postgres throws `invalid input syntax for type uuid` and you serve a 500. For tags, do the update in a transaction (`db.transaction`): upsert the tag rows, delete the post's old `post_tags` rows, insert the new ones.

Check it: your seed script created posts owned by other users. Take one of their ids and `PATCH` it with your cookie. You get 404, and the row is unchanged in Drizzle Studio.

### Step 6: Return errors that help you and not an attacker

For 400s, return the Zod issues (field path and message), so the editor can show them next to the right input. For unexpected errors, log the details on the server and return a generic 500 body. Never send a raw database error or a stack trace to the client: it reveals table names and query shapes.

Never change data on a `GET`. Links, prefetching and crawlers make GET requests freely, and the browser's cookie protections are weakest for them.

Check it: stop the database container and send a valid request. You get `{"error":"Something went wrong"}` in the response, and the real error in your terminal.

## Common mistakes

- **Checking sign-in but not ownership.** Symptom: any signed-in user can edit any post by changing the id. Fix: every data-layer write takes `userId` and puts `author_id = userId` in its `WHERE`.
- **Spreading the body into the update.** Symptom: a request with `"status":"published"` or `"authorId":"..."` actually changes them. Fix: build the update only from Zod's parsed output, with those fields absent from the schema.
- **Trusting client-side validation.** Symptom: the form blocks long titles, but `curl` saves a 2 MB one. Fix: the server schema is the rule. The form just shows it earlier.
- **Letting bad ids reach Postgres.** Symptom: a 500 and `invalid input syntax for type uuid` in your logs. Fix: validate route params with Zod too.
- **Returning 403 for someone else's draft.** Symptom: strangers can confirm a post exists by probing ids. Fix: answer 404 whenever the caller can't see the post at all.

## Say it in the interview

"Every write handler follows the same order: authenticate, parse, validate with Zod, then call a data-layer function that takes the caller's id and puts it in the `WHERE` clause. Ownership isn't a separate check I could forget. If the update matches zero rows, the caller gets a 404, so they can't even tell the post exists. I chose Route Handlers over Server Actions so I could attack my own API with `curl`. Server Actions are public endpoints too and would need exactly the same checks."

## Stretch goals

- Write a script that runs your "attacker" `curl` commands and fails if any response is a 2xx.
- Add optimistic concurrency: send `updatedAt` with each `PATCH` and return 409 if the post changed since you loaded it.
