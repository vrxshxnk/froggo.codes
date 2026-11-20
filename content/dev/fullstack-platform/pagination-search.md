---
id: pagination-search
project: fullstack-platform
title: Add pagination and full-text search
summary: >-
  Build a feed and tag pages that load ten posts at a time with cursor pagination, which never skips or repeats a post as new ones arrive, and add keyword search using Postgres's built-in full-text search.
time: 4-5 hours
doneWhen:
  - The home feed shows 10 posts and a "Load more" button that loads the next 10, until the end, where the button disappears
  - Publishing a new post while you're paging through doesn't make any post appear twice or go missing
  - "Searching \"index\" also finds posts that only say \"indexes\" or \"indexing\", and posts with the word in the title rank first"
  - Typing `'; drop table posts; --` or an unbalanced `"` into search returns results or nothing, never a 500
  - "`EXPLAIN ANALYZE` on a search query shows your GIN index being used"
docs:
  - label: "PostgreSQL: Controlling text search"
    url: https://www.postgresql.org/docs/current/textsearch-controls.html
  - label: "PostgreSQL: Text search tables and indexes"
    url: https://www.postgresql.org/docs/current/textsearch-tables.html
  - label: "PostgreSQL: Row constructor comparison"
    url: https://www.postgresql.org/docs/current/functions-comparisons.html
  - label: "Drizzle: Full-text search with PostgreSQL"
    url: https://orm.drizzle.team/docs/guides/postgresql-full-text-search
  - label: "Drizzle: Cursor-based pagination"
    url: https://orm.drizzle.team/docs/guides/cursor-based-pagination
---

## What you're building

The reader's side of Inkwell. The home page lists the latest ten published posts as cards, with title, excerpt, author, date and tags. At the bottom, "Load more" adds the next ten without reloading the page. Clicking a tag opens `/tags/<slug>`, the same feed filtered to one tag. A search box in the header goes to `/search?q=...` and lists the best matches first.

Link each card to `/posts/<slug>`. You'll build that page, with its visibility rule, in the [drafts milestone](/development/fullstack-platform/drafts-publish); a quick placeholder is fine for now.

## Why it matters

Pagination looks trivial and hides a real bug. The obvious approach, `OFFSET`, shows duplicates when new rows arrive and gets slower the deeper you go. Cursor (or "keyset") pagination is what large feeds use, and explaining why is a common system design question. Search is the same kind of judgement. Knowing that Postgres can already rank results by relevance, and choosing it over adding a whole new search service, is the "use what you have" thinking senior engineers look for.

## Before you start

- **Offset vs cursor.** `OFFSET 20 LIMIT 10` means "skip 20 rows, take 10". If a post is published between page 1 and page 2, everything shifts down one, so page 2 starts with page 1's last post again. A cursor means "posts older than this one". It's a position in the data, not a count, so new posts can't shift it.
- **Tie-breaking.** Two posts can share a `published_at`. If your cursor is only the timestamp, posts with the same time can be skipped. Use the pair `(published_at, id)` and compare it as a row: `(published_at, id) < ($t, $id)`. Postgres compares rows left to right, and your feed index from the schema milestone has exactly those columns.
- **`tsvector` and `tsquery`.** `to_tsvector('english', text)` turns text into normalised word stems ("indexes" becomes `index`) and drops filler words like "the". A `tsquery` is a search in the same form, and `@@` tests whether they match. `ts_rank` scores how well they match.
- **GIN index.** An index type built for "which rows contain this word?" lookups. Without one, every search reads every post.
- **Parameterised queries.** User input is sent to the database as a separate value, never pasted into the SQL text. Drizzle's `sql` template does this for you. `sql.raw` doesn't.

## Build it step by step

### Step 1: Write the feed query with a row cursor

In your data layer, write `listPublished({ cursor, tagSlug, limit })`. It always filters `status = 'published'`, orders by `published_at DESC, id DESC`, and, when there's a cursor, adds the row comparison. Ask for `limit + 1` rows: if you get the extra one, there's a next page. Drop it and use the last row you keep as the next cursor.

```text
rows = query(limit + 1)
hasMore = rows.length > limit
page = rows.slice(0, limit)
nextCursor = hasMore ? encode(page.at(-1).publishedAt, page.at(-1).id) : null
```

Check it: with your seed data, call it in a loop, page by page, until `nextCursor` is null. Collect every id: the count equals the number of published posts, and no id appears twice.

### Step 2: Make the cursor opaque and validate it

Encode the cursor as base64url JSON, for example `{"t":"2026-03-01T10:00:00.123Z","id":"..."}`, so clients treat it as a token rather than editing it. On the way in, decode it and validate it with Zod: a valid timestamp and a uuid, or 400.

Watch the precision trap. Postgres stores timestamps in microseconds and JavaScript `Date` keeps milliseconds. If a cursor is rounded to milliseconds, posts published inside that same millisecond can be skipped. The simple fix is to declare `published_at` with precision 3 in your Drizzle schema (a migration), so both sides agree.

Check it: pass `cursor=garbage` to the API. You get 400, not 500.

### Step 3: Build the feed page and Load more

Make `app/page.tsx` a server component that renders the first page directly. That's fast, and good for search engines. Add `GET /api/feed?cursor=...&tag=...`, which returns `{ posts, nextCursor }`. A small client component holds the list and a "Load more" button that fetches the next page and appends it. Build `/tags/[slug]` from the same pieces, with the tag filter (a join through `post_tags`).

Check it: open the feed, then publish a post from another tab (update one seeded draft's status and date in Drizzle Studio). Click "Load more". No card repeats.

### Step 4: Add a generated search column and a GIN index

Add a `search` column of type `tsvector` that Postgres computes itself from the title and content, as a *generated column*, so it's always up to date. Weight the title higher than the body with `setweight`, so title matches rank first. Drizzle doesn't ship a `tsvector` type, so you'll define a small custom type. The [Drizzle full-text search guide](https://orm.drizzle.team/docs/guides/postgresql-full-text-search) shows the custom type, `generatedAlwaysAs`, and a GIN index declared in the schema. Then generate and read the migration as usual.

```sql
-- the building blocks, for reference
setweight(to_tsvector('english', coalesce(title, '')), 'A')
setweight(to_tsvector('english', coalesce(content, '')), 'B')
```

Check it: `select title, search from posts limit 3;` shows stemmed words with positions and weights.

### Step 5: Write the search query safely

Write `searchPublished(q)`: filter `status = 'published'` and `search @@ websearch_to_tsquery('english', q)`, order by `ts_rank(search, query)` descending, then `published_at`, and limit to 20. Use `websearch_to_tsquery`, not `to_tsquery`. It accepts what people actually type: quoted phrases, `or`, `-word`. With messy input it does its best instead of throwing `syntax error in tsquery`.

Pass `q` as a parameter through Drizzle's `sql` template. Trim it, cap it at about 100 characters with Zod, and return an empty list for an empty query.

Check it: search for `'; drop table posts; --`. You get no results and your posts table is fine. Then run `EXPLAIN ANALYZE` on a search and look for a Bitmap Index Scan on your GIN index.

### Step 6: Build the search page

`app/search/page.tsx` reads `q` from `searchParams`, calls `searchPublished`, and renders the same cards as the feed. Put the query back into the search box, and show "No posts match 'xyz'" when there's nothing. Use a normal GET form, so the URL is shareable and the back button works.

Check it: search, open a result, press back. You're on the same results.

## Common mistakes

- **Using OFFSET for the feed.** Symptom: after a new post lands, "Load more" shows a card you've already seen. Fix: a `(published_at, id)` cursor.
- **A timestamp-only cursor.** Symptom: with seeded data where many posts share a time, some never appear. Fix: add `id` as the tie-breaker in the cursor, the `ORDER BY` and the index.
- **Forgetting `status = 'published'` in search or tag queries.** Symptom: drafts show up in search results. Fix: every public query filters status. The next milestone makes that impossible to forget.
- **Pasting input into SQL.** Symptom: a quote character in the search box causes a 500, or worse. Fix: parameters only. Search your code for `sql.raw` and justify every use.
- **No GIN index.** Symptom: search is fine with 50 posts and slow with 50,000. Fix: index the generated column, then confirm with `EXPLAIN`.

## Say it in the interview

"The feed uses keyset pagination on `(published_at, id)`. Offset pagination repeats posts when new ones arrive and slows down with depth, while a cursor stays correct and uses the same index for page 1 and page 1,000. The id breaks ties between posts with the same timestamp. For search I used a generated `tsvector` column with the title weighted above the body, a GIN index and `websearch_to_tsquery`, so user input can't break the query. The tradeoff versus Elasticsearch is fewer features, like typo tolerance, but I have no extra service to run or keep in sync."

## Stretch goals

- Replace "Load more" with infinite scroll using `IntersectionObserver`, but keep the button as a fallback.
- Highlight matching words in search results with `ts_headline`, then pass that output through your sanitiser before rendering it.
