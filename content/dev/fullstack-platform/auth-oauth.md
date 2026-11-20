---
id: auth-oauth
project: fullstack-platform
title: Implement authentication with OAuth
summary: >-
  Let writers sign in with GitHub using Auth.js, create their row in your users table the first time they arrive, and decide exactly what the session cookie carries.
time: 3-5 hours
doneWhen:
  - You can sign in with GitHub, see your name and avatar in the header, and sign out again
  - After your first sign-in there is exactly one row for you in `users`, and signing in again doesn't add another
  - "`/api/auth/session` returns your own database user id, not your GitHub id"
  - Opening `/dashboard` while signed out sends you to sign in, and the check lives in the page itself
  - "`AUTH_SECRET` and the GitHub client secret are in `.env.local` only, with fake values in `.env.example`"
docs:
  - label: "Auth.js: Installation"
    url: https://authjs.dev/getting-started/installation
  - label: "Auth.js: GitHub provider"
    url: https://authjs.dev/getting-started/providers/github
  - label: "Auth.js: Extending the session"
    url: https://authjs.dev/guides/extending-the-session
  - label: "GitHub Docs: Creating an OAuth app"
    url: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
  - label: "Drizzle: Upserts and conflicts"
    url: https://orm.drizzle.team/docs/insert
---

## What you're building

A "Sign in with GitHub" button in the header. Click it, approve Inkwell on GitHub's page, and you land back on the site signed in, with your avatar in the corner. On your first sign-in, Inkwell creates your row in its own `users` table. From then on the app knows you by that row's id, never by your GitHub account.

You also get one protected page, `/dashboard`, for signed-in users only. It will list your drafts later.

## Why it matters

Almost every product has sign-in, and few teams write OAuth by hand, because the protocol has many small steps where a mistake becomes a security hole. Companies need engineers who can wire up a library correctly and make the decisions it leaves to them: what goes in the session, where the user record lives, and how a page proves who the caller is. Every authorisation check you write later builds on this.

## Before you start

- **OAuth.** A way to sign in through another service without ever seeing the user's password. Your app sends the user to GitHub, GitHub asks them to approve, then redirects back to your *callback URL* with a one-time code. The server swaps the code for the user's profile. Auth.js does all of this for you.
- **Session.** After sign-in, the server needs to recognise the same user on the next request. Auth.js puts a signed, encrypted token in an HTTP-only cookie (one that JavaScript in the page can't read). On each request, `auth()` decodes that cookie on the server.
- **JWT strategy vs database sessions.** With the JWT strategy, the session data lives inside the cookie itself, and checking it needs no database query. With database sessions, the cookie holds only a random id, and the session lives in a table. Use JWT here: it's simpler, and you'll keep the token small. The tradeoff is that you can't log a user out remotely before the token expires.
- **Upsert.** "Insert this row, or update it if it already exists." In Postgres that's `INSERT ... ON CONFLICT (column) DO UPDATE`, and Drizzle exposes it as `onConflictDoUpdate`. It's how you create the user row on first sign-in without duplicates later.

## Build it step by step

### Step 1: Create the users table

Before auth can create users, they need a table. Add a `users` table to your Drizzle schema file with the columns below, then run `npm run db:generate` and `npm run db:migrate`. You'll add posts and tags in the [schema milestone](/development/fullstack-platform/schema-design).

```sql
users (
  id          uuid primary key default gen_random_uuid(),
  github_id   text unique not null,   -- the provider's id: stable, never reused
  handle      text unique not null,   -- github login, lowercased
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
)
```

Notice what isn't the key: email, which users can hide or change. The provider's account id never changes.

Check it: `npm run db:studio` shows an empty `users` table.

### Step 2: Register a GitHub OAuth app

On GitHub, go to Settings, then Developer settings, then OAuth Apps, and create a new app. Set the homepage to `http://localhost:3000` and the callback URL to exactly `http://localhost:3000/api/auth/callback/github`. Copy the client id and generate a client secret. You'll create a second app for production later, because each app has one callback URL.

```bash
# .env.local (fake values shown; the real ones never leave this file)
AUTH_SECRET=generate-with-npx-auth-secret
AUTH_GITHUB_ID=Ov23liExampleId
AUTH_GITHUB_SECRET=example-secret
```

Check it: `.env.example` has the same keys, with placeholders.

### Step 3: Install Auth.js and mount its routes

Follow the Next.js steps on the [Auth.js installation page](https://authjs.dev/getting-started/installation) for the current package version and command. You'll end up with an `auth.ts` file that calls `NextAuth({ providers: [GitHub], ... })` and exports `handlers`, `auth`, `signIn` and `signOut`, plus a catch-all route at `app/api/auth/[...nextauth]/route.ts` that exports `GET` and `POST` from `handlers`. Auth.js reads the `AUTH_GITHUB_*` variables by name, so you don't pass them in. Set `session: { strategy: "jwt" }` explicitly, so your choice is written down.

Add sign-in and sign-out buttons to the header. The Auth.js docs show both as small forms whose action calls `signIn("github")` or `signOut()` on the server.

Check it: click sign in, approve on GitHub, and land back on your site. Then open `/api/auth/session` in the browser. You should see JSON with your name and image. Your database id isn't there yet.

### Step 4: Create the user row on first sign-in

Auth.js has *callbacks*: functions you supply that run at set moments. The `jwt` callback runs whenever the token is created or read. On the sign-in call only, it also receives `account` (with `providerAccountId`, the GitHub id) and `profile` (with `login`, `name` and `avatar_url`). That's your moment.

```text
jwt callback({ token, account, profile }):
    if account exists:                   // only true on sign-in
        row = upsert users on github_id = account.providerAccountId
              set handle, name, avatar_url from profile
              returning id
        token.uid = row.id
    return token                         // every other call: no DB query
```

Then the `session` callback copies `token.uid` onto `session.user.id`, so the rest of your app can read it. TypeScript will complain that `id` doesn't exist on the session type. Fix it with module augmentation, as shown in [Extending the session](https://authjs.dev/guides/extending-the-session).

Check it: sign out and in three times. `users` still has one row for you. `/api/auth/session` now includes `id`, and it's the uuid from your table.

### Step 5: Decide what the token carries, and write it down

The cookie goes with every request, and whatever's in it is a copy that can go stale. Keep only what you need on almost every request and what rarely changes: your user id, and maybe the handle. Leave out the bio, post counts and anything else you can query. If you add roles later, remember that a role change won't take effect until the token is refreshed.

```json
{ "uid": "9b2f...e1", "name": "Asha", "picture": "https://avatars.githubusercontent.com/u/..." }
```

Write your decision as a comment in `auth.ts`.

Check it: in DevTools, open Application, then Cookies. The `authjs.session-token` cookie is marked HttpOnly, and `document.cookie` in the console doesn't show it.

### Step 6: Protect a page, and build a helper you'll use everywhere

Create `app/dashboard/page.tsx`. At the top of this server component, call `auth()`. If there's no session, `redirect()` to sign in. Then write a small helper, for example `requireUserId()` in `src/lib/auth-helpers.ts`. It returns the signed-in user's id or signals "unauthorised", and every route handler will call it in the [CRUD milestone](/development/fullstack-platform/crud-api).

Put the check in the page or handler itself. You can add a redirect in Next.js middleware (called proxy in newer versions) for convenience, but never as the only check. The Next.js docs advise verifying auth close to where the data is read.

Check it: open `/dashboard` in a private window. You should be sent to sign in. Sign in and you see it.

## Common mistakes

- **Wrong callback URL.** Symptom: GitHub shows "The redirect_uri is not associated with this application." Fix: it must match exactly, including `http` vs `https`, the port and the path `/api/auth/callback/github`.
- **Querying the database on every `jwt` call.** Symptom: an extra query on every page load. Fix: only touch the database when `account` is present, which means a sign-in.
- **Keying users by email or name.** Symptom: a user who changes their GitHub email gets a second account, or sign-in crashes on a null email. Fix: key on `github_id` and treat email as optional data.
- **Missing `AUTH_SECRET`.** Symptom: a `MissingSecret` error in the terminal, or everyone signed out after the value changes. Fix: generate it with `npx auth secret` and keep it stable per environment.
- **Trusting the client to say who it is.** Symptom: an API that reads `userId` from the request body. Fix: the user id comes only from `auth()` on the server.

## Say it in the interview

"I used Auth.js with GitHub rather than writing OAuth myself. Users are keyed by the provider's account id, not email, because emails change and can be hidden. I create the row with an upsert in the `jwt` callback, only on sign-in, so normal requests don't touch the database. The session token holds just my internal user id. The tradeoff of JWT sessions is that I can't revoke one instantly. For a blog that's fine, but for a bank I'd use database sessions."

## Stretch goals

- Add a second provider (Google) and decide how to link it to an existing user without trusting unverified emails.
- Give each user a public profile page at `/u/<handle>`.
