---
id: drafts-publish
project: fullstack-platform
title: Draft/publish workflow and protected routes
summary: >-
  Let writers publish, unpublish and archive posts, build the public post page, and make drafts invisible on every public path, including direct slug access. Then prove it with an automated test.
time: 3-5 hours
doneWhen:
  - From the dashboard you can publish a draft, unpublish it and archive it, and the feed updates each time
  - "Opening a draft's `/posts/<slug>` URL in a private window shows a 404 page with a 404 status"
  - The draft never appears in the feed, a tag page or search results for anyone but its author
  - "`npm test` runs a test that creates a draft and asserts that a stranger and another signed-in user both get nothing"
  - "Sending `{\"status\":\"published\"}` to the normal `PATCH` endpoint doesn't publish anything"
docs:
  - label: "Next.js: Authentication guide"
    url: https://nextjs.org/docs/app/guides/authentication
  - label: "Next.js: notFound"
    url: https://nextjs.org/docs/app/api-reference/functions/not-found
  - label: "Vitest: Getting started"
    url: https://vitest.dev/guide/
  - label: "OWASP: Authorization Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
---

## What you're building

The life cycle of a post. In the dashboard, each post shows its status and the buttons that make sense for it: Publish on a draft, Unpublish and Archive on a published post, Restore on an archived one. Publishing sets the date the post went live, and it appears at the top of the feed.

You'll also build the public post page at `/posts/<slug>`, rendered with your shared Markdown component. When the author opens their own draft there, a banner says "Draft: only you can see this." When anyone else opens the same URL, they get a 404, exactly as if the post didn't exist.

## Why it matters

Leaks rarely come through the front door. Your feed already filters drafts. The danger is the side doors: a tag page, search, a sitemap, a share image, or a guessed URL. You won't notice any of them by clicking around as yourself. This is your first authorisation test. "How do you know your access control works?" is a real interview question, and "I have a test that tries to read a draft as a stranger and expects nothing" is one of the few good answers.

## Before you start

- **State machine.** A fixed set of states plus the allowed moves between them. Writing it down stops impossible moves, like "archive a draft that was never published", from being possible.
- **One visibility rule.** "A post is visible to a viewer if it's published, or the viewer is its author." Write it once, as a function that returns a Drizzle `where` condition for a given viewer id, and use it in every read. A rule you write once can't drift. A rule copied into six queries will.
- **`notFound()`.** Calling it in a server component stops rendering and shows your `not-found` page with a real 404 status. That matters for crawlers, as well as for hiding drafts.
- **Where checks go.** The Next.js docs warn that a check in a layout isn't enough on its own, because layouts don't re-run on every navigation. Check in each page, or better, in the data function the page calls.
- **Vitest.** A fast test runner for TypeScript projects. A test file calls your functions and asserts results with `expect(...)`, and `npm test` runs it.

## Build it step by step

### Step 1: Write down the state machine

Decide the allowed moves, and what each one does to `published_at`:

```text
draft      --publish-->   published   set published_at = now() if it is null
published  --unpublish--> draft       keep published_at (in case they republish)
published  --archive-->   archived    hidden from all lists and the post page
archived   --restore-->   published
anything else             -> 409 Conflict
```

Decide whether republishing keeps the original date or bumps the post to the top, and write it in the README. Once published, a slug is frozen, even if the title changes.

Check it: you can answer "what happens if I publish an archived post?" from the table alone.

### Step 2: Add a separate status endpoint

Create `POST /api/posts/[id]/status` with a body of `{ "to": "published" }`. It follows the usual order: `requireUserId()`, Zod (an enum of the target states), then one owner-scoped update. Make the update conditional on the current status too, for example `WHERE id = :id AND author_id = :me AND status = 'draft'` for publish, so the transition and the check happen in a single statement. Zero rows back means either not yours (404) or not allowed from this state (409). Look the post up again to tell which.

Before publishing, check the post has a title and some content, or return 400.

Check it: with `curl`, publish a post twice in a row. The first call returns 200, the second 409. Then send `status` to your normal `PATCH`: the Zod schema from the CRUD milestone ignores it.

### Step 3: Write the visibility rule once

In your data layer, add `visibleTo(viewerId)`. It returns the condition `status = 'published'`, or `status = 'published' OR author_id = viewerId` when there's a viewer. Then go through every read that serves public pages and make each one use it, or use `status = 'published'` explicitly where only public posts belong (the feed, tags and search):

```text
getPostBySlug(slug, viewerId)   visibleTo(viewerId)     post page
listPublished(...)              status = 'published'   feed, tag pages
searchPublished(q)              status = 'published'   search
(later) sitemap, OG image       status = 'published'
```

Check it: search your codebase for every query on `posts`. Each one is either owner-scoped (dashboard, editor) or goes through the rule. Nothing else exists.

### Step 4: Build the post page

Create `app/posts/[slug]/page.tsx`. It reads the session (a viewer may or may not be signed in), calls `getPostBySlug(slug, viewerId)`, and calls `notFound()` when that returns nothing. Render the title, author, date, cover and the body through your shared `Markdown` component. If the viewer is the author and the status isn't `published`, show the draft banner.

Then rerun your XSS fixture from the [editor milestone](/development/fullstack-platform/markdown-editor) on this page: publish a post containing it, and confirm nothing fires.

Watch out for caching. If you ever cache `getPostBySlug` (with `unstable_cache` or `"use cache"`), the viewer id must be part of the cache key. Otherwise the author's view of a draft can be served to the next stranger.

Check it: open your own draft's URL signed in, and you see the banner. Open it in a private window, and the Network tab shows a 404 response.

### Step 5: Protect the dashboard pages

Every page under `/dashboard` must check the session itself, or call a data function that does. Don't rely on a layout or on middleware alone. The dashboard lists only the caller's posts (owner-scoped), grouped by status, with the right buttons for each.

Check it: signed out, paste a dashboard URL and an edit URL into the address bar. Both send you to sign in.

### Step 6: Write the test that tries to break in

Add Vitest, and point it at a separate test database (for example `inkwell_test` in the same Docker container), with its own `DATABASE_URL` in `.env.test`. Run your migrations against it before the tests. Then write the test as a story:

```text
setup:  create users A and B; A creates a draft with slug "secret-plan"
expect: getPostBySlug("secret-plan", null)  -> null      (stranger)
expect: getPostBySlug("secret-plan", B.id)  -> null      (another user)
expect: getPostBySlug("secret-plan", A.id)  -> the post  (author)
expect: listPublished(), searchPublished("secret"), tag "x" -> none contain it
then:   publish it -> the stranger can now see it
```

The last line proves the test can fail, rather than passing because the query is broken for everyone.

Check it: temporarily remove the status condition from `getPostBySlug`. `npm test` goes red. Put it back, and it's green.

## Common mistakes

- **Filtering drafts only in the feed.** Symptom: drafts show up on tag pages, in search, or at their direct URL. Fix: one visibility rule, used by every public read, plus the test.
- **Returning 403 on someone else's draft.** Symptom: anyone can confirm that a secret post exists. Fix: `notFound()`. To a stranger, a draft doesn't exist.
- **Publishing through the general update.** Symptom: `PATCH { "status": "published" }` publishes, skipping your checks and leaving `published_at` empty. Fix: status changes only through the status endpoint, and the update schema has no `status`.
- **`server-only` breaking your tests.** Symptom: Vitest fails on import, with an error from the `server-only` package saying it can't be imported from a Client Component. Fix: alias `server-only` to an empty file in your Vitest config.
- **A test that can't fail.** Symptom: the test stays green even when you break the query. Fix: assert that the author *can* see the post, and that the stranger can after publishing.

## Say it in the interview

"Drafts were the easiest thing to leak, so I wrote one visibility rule, published or yours, and every public read uses it: the post page, feed, tags, search and sitemap. Strangers get a 404, not a 403, so they can't even confirm a draft exists. Status changes go through their own endpoint, with the allowed transitions in the `WHERE` clause. I have a test that creates a draft and tries to read it as a stranger and as another user, and I checked it fails if I remove the rule. The tradeoff is that the post page can't be fully cached, because it depends on the viewer."

## Stretch goals

- Schedule posts: a `scheduled` status with a future `published_at`, and update the visibility rule to compare it with `now()`.
