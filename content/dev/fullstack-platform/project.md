---
id: fullstack-platform
name: Inkwell
tagline: A multi-user blog platform with auth, a database and uploads
summary: >-
  Build a publishing platform where anyone can sign in with GitHub, write posts in markdown, add images and publish them. It's your first real backend, and its real subject is security: the server checks everything.
time: About 2 weeks, 35-45 hours
---

## What you're building

Inkwell is a blog platform for many writers. A visitor lands on a feed of the latest published posts, scrolls to load more, searches by keyword, and opens a post at a clean URL like `/posts/why-i-love-postgres`. A writer signs in with GitHub, opens an editor with markdown on the left and a live preview on the right, drops in a cover image, and watches "Saved" appear every few seconds while they type. When they're ready they press Publish. Until then, the draft is invisible to everyone else, even someone who guesses its URL.

This is the first project where your mistakes can hurt other people. In DevBoard a bug annoyed one user: you. Here a missing check lets a stranger edit someone else's post, and a careless markdown renderer runs an attacker's script in every reader's browser. So the code is only half the work. The other half is a habit: **the server trusts nothing the browser sends.**

## Features

- Sign in with GitHub; your user row is created the first time you sign in
- A Postgres schema of users, posts and tags, built around the queries the app runs
- A post API (create, read, update, delete) where every write checks who you are and whether you own the post
- A markdown editor with live preview, sanitised output and autosave
- Cover images and inline images uploaded straight to object storage
- A feed with cursor pagination, plus full-text search
- Drafts, published and archived posts, with drafts hidden from every public path
- Per-post titles, descriptions, generated share images and a sitemap
- Separate dev and prod environments, with migrations and secrets kept out of git

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| Framework | Next.js App Router with TypeScript | Pages, API routes and server code in one project and one deploy. |
| API style | Route Handlers (`app/api/.../route.ts`) | Plain HTTP endpoints you can hit with `curl` and test. Server Actions are the common alternative; they're public endpoints too and need exactly the same checks. |
| Database | Postgres: local in Docker for dev, Neon for prod | The most widely used open-source relational database, with full-text search built in. Supabase or any hosted Postgres works the same way. |
| ORM and migrations | Drizzle ORM and drizzle-kit | Reads like SQL, so you learn SQL. It also handles the generated search column you'll need later. Prisma is the popular alternative. |
| Auth | Auth.js (`next-auth` v5) with the GitHub provider | OAuth done by a maintained library. Firebase Auth is the managed alternative. |
| Validation | Zod | One schema per request body, checked on the server. |
| Markdown | react-markdown, remark-gfm, rehype-sanitize | Maintained parsers, and a sanitiser you can point to. |
| Images | An S3 bucket via the AWS SDK presigner | The standard presigned-URL pattern. Cloudflare R2 speaks the same API; UploadThing wraps it for you. |
| Hosting | Vercel | Built by the Next.js team, with separate Production and Preview settings. |

## How it fits together

```text
 browser ──(cookie)──► Next.js on Vercel
   │                     ├─ pages (server components)
   │                     ├─ /api/posts  ──► auth() ─► zod ─► Drizzle ─► Postgres
   │                     ├─ /api/auth/* (Auth.js) ◄──► GitHub OAuth
   │                     └─ /api/uploads ─► signs an upload URL
   │                                              │
   └──────── PUT image bytes directly ───────────►  S3 bucket
                                                (only the URL is saved)
```

Follow one action: a writer edits a draft and pauses typing. After two seconds the editor sends `PATCH /api/posts/42` with the new title and content. The route handler calls `auth()` to read the session from the cookie and gets the user's id, or rejects the request with 401. It parses the body with a Zod schema that only knows `title` and `content`, so a sneaky `authorId` field is dropped. Then it runs one update scoped to `id = 42 AND author_id = <caller>`. If no row matches, the caller doesn't own the post and gets a 404. The response comes back, and the editor shows "Saved". Every write in the app follows that same path: who are you, is the input valid, do you own it.

## Out of scope

- **Comments, likes and follows.** Each is more CRUD of the same kind. Make posts excellent first.
- **Email and password sign-in.** Storing passwords safely, resets and verification are a project of their own. OAuth gives you real auth without them.
- **A rich-text (WYSIWYG) editor.** A textarea and a preview teach the security lesson. A block editor teaches someone else's API.
- **Roles, admins and moderation.** One rule, "you can change only what you own", is enough to learn authorisation properly.
- **Rate limiting and caching layers.** They matter in production, and you'll meet them in later projects. Here they'd distract from the basics.
- **Elasticsearch or a search service.** Postgres search is good and already running.

## How to work through it

1. **Foundations** ([stack and scaffold](/development/fullstack-platform/stack-scaffold), [auth](/development/fullstack-platform/auth-oauth), [schema](/development/fullstack-platform/schema-design)): about 10 hours. Deploy the empty scaffold early, so deploying is never scary.
2. **The core** ([CRUD API](/development/fullstack-platform/crud-api), [editor](/development/fullstack-platform/markdown-editor), [image uploads](/development/fullstack-platform/image-upload)): about 15 hours. This is where the security habits form.
3. **Reading** ([pagination and search](/development/fullstack-platform/pagination-search), [drafts and protected routes](/development/fullstack-platform/drafts-publish)): about 8 hours.
4. **Shipping** ([SEO](/development/fullstack-platform/seo-og), [environments](/development/fullstack-platform/deploy-envs)): about 6 hours.

The rule that matters most: **every write checks two things on the server, who the caller is and whether they own the thing.** Write that check before the feature works, not after. Test every new endpoint once with `curl` and no cookie. If it does anything except refuse, stop and fix it.

## Show it off

Your README should include:

- A live link, and a GIF of writing a post, uploading an image and publishing it
- Your schema (the table sketch from the schema milestone) and the three queries it was designed for
- A "Security" section: how auth works, where validation happens, how markdown is sanitised, and a link to your draft-leak test
- How to run it locally, with a `.env.example` that lists every variable and contains no real values
- How migrations reach production

In your demo, open a terminal and try to edit someone else's post with `curl`. Show the 401 without a cookie, then the 404 with your own cookie on their post. Few student projects can show that.

Resume bullets to adapt (use your own numbers):

- "Built a multi-user blog platform in Next.js and Postgres with GitHub OAuth, owner-scoped writes and Zod validation on every endpoint, backed by N automated authorisation tests"
- "Replaced offset pagination with keyset cursors and Postgres full-text search, keeping feed queries under X ms at Y posts"
