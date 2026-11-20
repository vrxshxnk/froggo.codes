---
id: seo-og
project: fullstack-platform
title: "SEO: metadata, OG images, sitemap"
summary: >-
  Give every post its own title, description and generated share image, and publish a sitemap and robots file, so your posts look right in search results and when someone pastes a link into a chat app.
time: 2-3 hours
doneWhen:
  - "View source on any post shows its own `<title>`, `meta name=\"description\"`, and `og:title`, `og:description` and `og:image` tags with absolute URLs"
  - Opening a post's `/opengraph-image` URL shows a 1200x630 image with the post's title and author
  - Pasting a deployed post link into a chat app shows a preview with the right title and image
  - "`/sitemap.xml` lists every published post and no drafts, and `/robots.txt` points to it"
  - A draft's share-image URL returns 404, just like its page
docs:
  - label: "Next.js: generateMetadata"
    url: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  - label: "Next.js: opengraph-image file convention"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
  - label: "Next.js: ImageResponse"
    url: https://nextjs.org/docs/app/api-reference/functions/image-response
  - label: "Next.js: sitemap.xml"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
  - label: "The Open Graph protocol"
    url: https://ogp.me/
---

## What you're building

Share a post on WhatsApp, LinkedIn or Discord, and instead of a bare link, people see a card: a bold image with the post's title and the author's name, a headline, and a one-line description. In a browser tab, each post has its own title. Search engines find every published post through a sitemap, and are told to keep out of your dashboard and API.

All of it comes from data you already have. You'll use Next.js's metadata features and generate the images on the fly, so there's no design tool and nothing to keep in sync.

## Why it matters

For a content site, shared links are how many readers arrive, and a bare URL gives people no reason to click. Product teams care about this, and it's where full-stack work meets marketing. It also tests your earlier work: the share image and the sitemap are two more public paths that must respect the draft rule. Getting metadata right is a small, visible detail that shows you finish things properly.

## Before you start

- **Meta tags.** Tags in the page's `head` that browsers, search engines and chat apps read. `<title>` and `meta name="description"` are for search results. The Open Graph tags (`og:title`, `og:description`, `og:image`), defined at [ogp.me](https://ogp.me/), are what most apps use for link previews.
- **The Metadata API.** In the App Router, you don't write head tags yourself. A page exports `generateMetadata`, which returns an object (`title`, `description`, `openGraph`, ...), and Next.js renders the tags.
- **`metadataBase`.** Preview images must be absolute URLs (`https://...`), because a chat app fetching your page doesn't know your domain. Setting `metadataBase` in the root layout lets Next.js turn relative paths into absolute ones.
- **`ImageResponse`.** Next.js ships `@vercel/og` built in, as `ImageResponse` from `next/og`. You describe the image in JSX, and it renders a PNG. It supports only a subset of CSS: flexbox layout, and no grid.
- **Sitemap and robots.** `sitemap.xml` lists the URLs you want indexed. `robots.txt` says what crawlers shouldn't visit. In the App Router, `app/sitemap.ts` and `app/robots.ts` generate them from code.

## Build it step by step

### Step 1: Set site-wide defaults

In `app/layout.tsx`, export `metadata` with `metadataBase` set to your site's URL (from an environment variable, so dev and prod differ), a default description, and a title template like `"%s | Inkwell"`. With the template, a post only needs to return its own title.

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

This one can be public: it's not a secret, and both server and client may need it.

Check it: view source on the home page. The `<title>` and description are there.

### Step 2: Give each post its own metadata

In `app/posts/[slug]/page.tsx`, export `generateMetadata`. It loads the post with the same `getPostBySlug(slug, viewerId)` as the page, and calls `notFound()` if there's nothing. Return the title, a description and `openGraph` with `type: "article"`, the publish time and the author's name. Use the excerpt for the description. If there isn't one, use the first 150 or so characters of the post as plain text, with the markdown symbols removed.

`generateMetadata` and the page both load the same post. Wrap `getPostBySlug` in React's `cache()` so it runs once per request. For an author viewing their own draft, add `robots: { index: false }`.

Check it: view source on two different posts. Each has its own title and description.

### Step 3: Generate the share image

Add `app/posts/[slug]/opengraph-image.tsx`. It exports `size` (1200 by 630), `contentType` (`image/png`), and a default function that loads the post and returns an `ImageResponse`. Keep the design simple: your brand colour, the title in large type, the author's name and handle, and "Inkwell" in a corner. Next.js detects the file and adds the `og:image` tag to the post page for you.

This file is a public route of its own, so it needs the draft rule too. Load the post as a stranger (no viewer id) and call `notFound()` when it isn't published. Otherwise anyone can read a draft's title by requesting its image.

Check it: open `/posts/<slug>/opengraph-image` in the browser. You see the image. Try a long title: it should wrap, not run off the edge. Try a draft's slug: 404.

### Step 4: Add a sitemap and robots file

Create `app/sitemap.ts`. It returns a list of `{ url, lastModified }` entries: the home page, each published post (with `updated_at` as `lastModified`) and each tag page. Query with `status = 'published'`, the same rule as everything public. Create `app/robots.ts`, which allows everything except `/dashboard` and `/api`, and points to the sitemap's absolute URL.

```text
User-Agent: *
Allow: /
Disallow: /dashboard
Disallow: /api
Sitemap: https://your-site.example/sitemap.xml
```

`robots.txt` is a polite request, not security. Your dashboard is protected by the session checks you already wrote.

Check it: open `/sitemap.xml`. Count the entries against your published posts, and confirm no draft slug is in it.

### Step 5: Test it the way the world sees it

Chat apps can't fetch `localhost`, so push and test on a deployed preview URL. Paste a post link into a chat app, or into the Facebook Sharing Debugger or LinkedIn's Post Inspector. These tools show exactly what they read, and can re-fetch on demand. Previews are cached heavily, so after a fix, use the debugger's re-scrape button rather than assuming your change failed.

Check it: the preview shows your post's title, description and generated image. If the image is missing, open the `og:image` URL from view-source directly. If it isn't an absolute `https://` URL that loads in a private window, that's your bug.

## Common mistakes

- **Relative `og:image` URLs.** Symptom: previews show the title but no image. Fix: set `metadataBase` so Next.js writes absolute URLs, and use your real domain in production.
- **Leaking drafts through images or the sitemap.** Symptom: a draft's title is readable at its `opengraph-image` URL, or its slug shows up in `sitemap.xml`. Fix: both use the published-only rule.
- **CSS that `ImageResponse` doesn't support.** Symptom: a blank or broken image, or an error about unsupported styles. Fix: lay out with flexbox, give every element with several children `display: flex`, and avoid grid.
- **The same title on every page.** Symptom: browser tabs and search results all say "Inkwell". Fix: `generateMetadata` on each dynamic page, plus a title template in the layout.
- **Judging a fix by a cached preview.** Symptom: "my change didn't work." Fix: use the debugger's re-scrape, or test with a fresh post.

## Say it in the interview

"Every post has its own metadata from `generateMetadata`, and an Open Graph image generated on demand with `ImageResponse`, so there are no image files to keep in sync. I treated the image route and the sitemap as public endpoints, with the same published-only rule as the post page, because otherwise they'd leak draft titles. I checked the results in a link-preview debugger on a deployed preview. The tradeoff is that images are rendered on request, which costs a little compute each time, but it's much simpler than generating and storing them at publish time."

## Stretch goals

- Add `Article` structured data (JSON-LD from [schema.org](https://schema.org/Article)) to each post.
- Add an RSS feed at `/feed.xml` with a Route Handler, applying the same published-only rule.
