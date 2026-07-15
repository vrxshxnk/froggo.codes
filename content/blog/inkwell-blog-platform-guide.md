---
title: "Project 3: Inkwell — Your First Real Backend (and the Security Mistakes Everyone Ships)"
excerpt: "The full build guide for Project 3 of our Development Roadmap. Auth, schema design, markdown with stored-XSS protection, image uploads, cursor pagination — the baseline for every junior full-stack role."
date: "2026-07-11"
author: "Froggo"
tags: ["projects", "roadmap", "backend", "database", "security"]
featured: false
---

Projects 1 and 2 lived entirely in the browser, where the worst possible bug annoys one user: you. Inkwell is where that changes. A multi-user blog platform means a database, authentication, and — for the first time — code where a mistake affects *other people's data*.

This is the companion guide to [Project 3 of the Development Roadmap](/development). Ten milestones, two weeks, and a different kind of difficulty than the first two projects: less "how do I make this work" and more "how do I make this safe." That shift in mindset is the actual curriculum.

## Pick boring technology, and write down why

Milestone 1 says choose a stack, and the hint contains the best sentence of advice in the whole project: **pick boring technology you can debug.** Next.js App Router plus Postgres through an ORM (Prisma or Drizzle) is the well-lit path; Firebase is a fine alternative if you want managed auth and don't want to run a database.

What "boring" buys you is not simplicity — it's *searchability*. When your exotic stack breaks at 11pm, you're alone with it. When Next.js + Postgres breaks, ten thousand people hit the same wall last year and three of them wrote blog posts. Junior developers consistently overvalue novelty and undervalue debuggability; the ratio flips with experience. Skip ahead.

And commit the scaffold with a README stating what you're building and why. It feels ceremonial. It isn't — every project you'll ever be paid to work on starts with a doc, and the habit of writing down intent before code is one interviewers explicitly probe for.

## The mindset shift: the server is the security boundary

Here is the single most important idea in this project, the one that separates people who've built full-stack apps from people who've followed full-stack tutorials:

> **Client-side validation is a courtesy. Server-side validation is the security boundary. Anything the client sends is a suggestion from a stranger.**

Your React form can validate all it wants — an attacker doesn't use your form. They use `curl`. Every mutation on your API needs to check, *on the server*: is this caller signed in, and do they own the thing they're touching? Then validate the request body against a schema (zod is the standard tool) before it goes anywhere near your database.

This principle recurs in almost every milestone below. Watch for it.

## Schemas serve queries, not diagrams

Milestone 3 is three tables — users, posts, tags with a join table — and the hint carries a piece of design wisdom that took the industry decades to articulate: **write the queries you'll need before you finalize the schema.**

"Latest 10 published posts with a given tag, newest first." "All drafts by this user." "Post by slug, but only if published or owned by the caller." Sketch these first and the schema almost designs itself — you'll notice `posts` needs `author_id`, `slug`, `status`, and `published_at`, and that `published_at` needs an index because everything sorts by it.

Design the schema from an entity-relationship diagram instead, and you'll produce something beautiful that requires four joins to render the homepage.

Two specific choices worth stealing:

- **`status` as a column, not a boolean.** `is_published` feels sufficient today. Then you want "archived," and every boolean check in the codebase becomes a migration. A status enum costs nothing now and absorbs the future.
- **Slugs are unique, URLs are forever.** Decide your slug rules (lowercase, hyphens, uniqueness enforcement) at schema time, because changing URL structure after anyone has linked to you is a permanent tax.

## The markdown editor is a stored-XSS machine unless you make it not one

Milestone 5 — markdown editing with live preview — hides the most dangerous bug in the entire project, and most tutorials walk you straight into it.

Markdown allows inline HTML. That's a feature of markdown, per the spec. So when a user writes a post containing a `<script>` tag and your platform renders it, that script executes in the browser of *every reader who opens the post* — stealing their session, acting as them. This is stored XSS, it's been a top-three web vulnerability for twenty years, and a naive markdown pipeline ships it by default.

The fix is one library: sanitize the rendered HTML output (`rehype-sanitize` if you're in the unified/remark ecosystem) so script tags, event handlers, and javascript: URLs are stripped no matter what a user writes. One line of configuration. The lesson is bigger than the fix: **user-generated content is hostile until proven otherwise**, and any pipeline that turns user input into markup needs a sanitization step you can point to.

While you're in the editor: autosave drafts to the server every few seconds. Losing forty minutes of writing to a closed tab is the single fastest way to lose a user's trust, and debounced autosave is an afternoon of work.

## Images don't go in the database

Milestone 6, and a rule with no exceptions at this scale: the database stores the image's *URL*, never the image. Binary blobs in Postgres bloat backups, wreck query performance, and buy you nothing.

The professional pattern — the one used by effectively every production app you've ever uploaded a photo to — is the presigned URL flow: client asks your API for permission, API returns a short-lived signed upload URL for object storage (S3 or equivalent; UploadThing and Firebase Storage wrap this for you), client uploads *directly to storage*, and only the resulting URL touches your server. Your API never proxies image bytes.

The security-boundary principle applies here too: enforce file type and size limits *server-side*, in the presigning step. A client-side file picker filter is — say it with me — a courtesy.

## Cursor pagination, and why OFFSET lies

Milestone 7 specifies cursor pagination over offset pagination, and it's worth understanding why, because the difference is invisible in development and glaring in production.

Offset pagination (`OFFSET 20 LIMIT 10`) has a race condition built in: if a new post is published while a reader is on page 1, every subsequent post shifts down by one, and page 2 starts with a duplicate of page 1's last item. On a feed that updates, offset pagination *visibly stutters*. It also gets slower the deeper you page, because the database must count and discard every skipped row.

Cursor pagination — `WHERE published_at < $last_seen ORDER BY published_at DESC LIMIT 10` — has neither problem. The cursor is a stable position in the data, not a count. New posts don't shift it, and the index makes page 100 as fast as page 1.

For search in the same milestone: Postgres full-text search with `tsvector` is genuinely good and costs you nothing you don't already run. Reaching for Elasticsearch on a blog platform is the novelty-over-debuggability mistake from milestone 1 wearing a different hat.

## Write the test that proves a stranger can't read a draft

Milestone 8's hint ends with an instruction that's easy to read past: write one test proving an unauthenticated user cannot fetch someone's draft. Do not skip this one.

Draft leakage is sneaky because drafts hide in the *obvious* place — the homepage feed — while leaking through the side doors: the tag pages, the search index, the RSS feed if you built one, and above all **direct slug access**. The post isn't linked anywhere, but the URL works if you guess it. Every one of those code paths needs the same `status = 'published' OR author = caller` check, and the only way to know they all have it is a test that tries to break in.

This is also, not coincidentally, your first authorization test — and "how do you test that your access control works?" is a real interview question with a very short list of good answers. "I wrote a test that fetches a draft as a stranger and asserts a 404" is one of them.

## Break prod once, on purpose, while nobody's watching

The final milestone — separate dev and prod environments, secrets only in the host's settings, migrations instead of manual SQL — is the least glamorous and the most professional. Two details deserve emphasis:

**Never run schema changes by hand.** A migration workflow (Prisma Migrate, Drizzle Kit) means every schema change is a versioned file that replays identically in dev and prod. Manual SQL means your two databases drift apart silently until something breaks in prod that works on your machine — which is the least debuggable class of failure that exists.

**And break production once, deliberately, now.** Push a bad deploy. Watch what happens. Practice the rollback. The first time you break prod should not be the first time anyone's using it — stakes-free failure is a training resource, and this is the last project where you'll have it. (Project 5 has payments in it.)

## What this project proves

Inkwell is the baseline for every junior full-stack role: you designed a schema around real queries, put authentication and authorization on the server where they belong, handled hostile input, stored media the professional way, and shipped it with a migration workflow and two environments. From here on, the projects stop teaching you to build apps and start teaching you to build *systems*.

---

**Ready to build it?** All ten milestones with hints are on the [Development Roadmap](/development) — free, sign in to track progress. Previously: [Project 2, DevBoard](/blog/devboard-kanban-project-guide). Next: [Project 4, Huddle](/blog/huddle-realtime-chat-guide), where the network becomes unreliable and that's the whole point.
