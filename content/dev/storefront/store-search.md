---
id: store-search
project: storefront
title: Instant search with debouncing
summary: >-
  Add a search box that shows the top 5 matching products as you type, waits about 250 ms between keystrokes before asking the server, cancels stale requests with AbortController, and sends Enter to the full filtered listing.
time: 3-4 hours
doneWhen:
  - Typing "hoodie" at normal speed sends one or two requests, not six (check the Network tab)
  - On a throttled connection, typing fast never leaves results for an older query on screen
  - The dropdown shows at most 5 products, each with a thumbnail, name and price
  - Pressing Enter with nothing highlighted opens /products?q=... with the full results
  - Searching for % or _ doesn't return the whole catalog
  - You can reach, move through and pick results with only the keyboard
docs:
  - label: "MDN: AbortController"
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  - label: "PostgreSQL: pg_trgm"
    url: https://www.postgresql.org/docs/current/pgtrgm.html
  - label: "PostgreSQL: pattern matching"
    url: https://www.postgresql.org/docs/current/functions-matching.html
  - label: "WAI-ARIA: combobox pattern"
    url: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
---

## What you're building

A search box in the site header. Type "hoo" and, a quarter of a second after you pause, a dropdown shows up to five matching products, each with a small photo, its name and its "from" price. Keep typing and the results follow you without flickering between old and new answers. Arrow keys move through the results, Enter on a highlighted one opens that product, and Enter on its own takes you to `/products?q=hoodie`, the full listing with your existing filters available on top.

## Why it matters

Instant search looks simple and hides two real bugs: flooding your server with a request per keystroke, and showing answers to a question the user has stopped asking. Fixing both is a short, concrete story about performance and async correctness. It also shows you know how to cancel work in the browser. Interviewers often ask how you'd build typeahead, and "debounce plus AbortController plus a trigram index" is a complete answer you can actually demonstrate.

## Before you start

- **Debouncing.** Wait until the user has stopped typing for a set time, here about 250 ms, before acting. Each keystroke resets a timer with `clearTimeout` and `setTimeout`, so only the last one fires.
- **Race conditions in the browser.** Requests don't come back in the order you sent them. If "hoo" is slow and "hoodie" is fast, the "hoo" results can arrive last and overwrite the right ones. Debouncing reduces this but doesn't remove it.
- **`AbortController`.** Create one per request and pass its `signal` to `fetch`. Calling `controller.abort()` cancels that request, and its promise rejects with an `AbortError` that you should quietly ignore.
- **Trigram search.** The `pg_trgm` extension splits text into three-letter pieces and can index them, so `ILIKE '%hood%'` stays fast and partial words match as the user types. It suits short product names better than full-text search, which matches whole words.

## Build it step by step

### Step 1: Prepare the database

Enable the extension and index product names. Most hosted Postgres providers, including Neon and Supabase, offer `pg_trgm`, but check your provider's extension list.

```sql
create extension if not exists pg_trgm;
create index products_name_trgm on products using gin (name gin_trgm_ops);
```

Put these in a migration, not just in `psql`, so every environment gets them.

Check it: `explain analyze` a query with `name ilike '%hood%'`. Once the table has enough rows for the planner to bother, it uses the index. On 30 products a sequential scan is fine and expected.

### Step 2: Build the search endpoint

Write `GET /api/search?q=...`. Validate `q` with Zod: trim it, require 2 to 50 characters, and return an empty list otherwise. Before using it in `ILIKE`, **escape** `%`, `_` and `\`, which are wildcards in `LIKE` patterns. Otherwise a search for `%` matches everything. Rank by `similarity(name, :q)` descending, limit to 5, and return only what the dropdown needs:

```json
{ "q": "hood", "results": [
  { "slug": "pond-hoodie", "name": "Pond Hoodie",
    "thumbnail": "/products/pond-hoodie-black-200.jpg", "fromPrice": 149900 } ] }
```

Echoing `q` back is useful: the client can check the response belongs to the current input. Add a short `Cache-Control` max-age if you like, since the same query gives the same answer for a while.

Check it: `curl "localhost:3000/api/search?q=%25"` (that's `%`) returns an empty or tiny list, not the whole catalog.

### Step 3: Debounce the input

Make the search box a Client Component holding `query`, `results`, `status` and `highlighted` in state. On each change, update `query` at once, so typing never feels slow, but start the fetch only after 250 ms without another keystroke. Clear the timer when the component unmounts. Don't search below 2 characters. Close the dropdown instead.

Check it: type "hoodie" at normal speed with the Network tab open. You see one request (two if you paused mid-word), not one per letter.

### Step 4: Cancel stale requests

Keep the current `AbortController` in a ref. When a new debounced search starts, abort the previous one, create a new controller, and pass `controller.signal` to `fetch`. When a response arrives, also check that its `q` matches the latest query before showing it. That's a cheap second guard. Ignore `AbortError`, but show a quiet "Search is unavailable" for real errors.

Check it: in devtools, throttle the network to "Slow 4G" and type "hoodie" with small pauses. Older requests show as cancelled in the Network tab, and the dropdown never shows results for anything but the latest text.

### Step 5: Build the dropdown with keyboard support

Show at most five results with thumbnail, name and formatted price, plus states for loading, "No products match 'xyz'", and errors. Reserve the dropdown's height while loading so it doesn't jump. Follow the WAI-ARIA combobox pattern: the input has `role="combobox"` and `aria-expanded`, the list has `role="listbox"`, each result is an `option`, and `aria-activedescendant` points at the highlighted one. Up and Down move the highlight, Escape closes, and Enter acts.

Check it: put your mouse away, Tab to the search box, type, arrow down to the third result, press Enter, and land on that product.

### Step 6: Send Enter to the full listing

Enter with nothing highlighted goes to `/products?q=hoodie`. Add `q` to the Zod schema from [the listing milestone](/development/storefront/listing-filters), and add an `ILIKE` condition on the product name, escaped the same way, to the `WHERE` clause there. The search term then lives in the URL like every other filter, so it combines with size and price filters and works with the back button.

Check it: search "hoodie", press Enter, then tick Size M. The URL holds both, and a refresh keeps both.

## Common mistakes

- **A request per keystroke.** Symptom: typing "hoodie" fires six requests, and your database logs fill up. Fix: debounce, and don't search under 2 characters.
- **No cancellation.** Symptom: on a slow connection, results for "hoo" replace results for "hoodie". Fix: abort the previous request, and check the echoed `q` before rendering.
- **Showing `AbortError` as a failure.** Symptom: an error message flashes every time you type quickly. Fix: ignore errors whose `name` is `AbortError`.
- **Unescaped wildcards.** Symptom: searching `%` or `_` returns the whole catalog. Fix: escape `%`, `_` and `\` before building the pattern, and pass it as a bound parameter.
- **Debouncing the input value itself.** Symptom: letters appear on screen late and typing feels broken. Fix: update the input immediately, and debounce only the fetch.

## Say it in the interview

"The search box updates instantly but only queries after 250 ms of no typing, which cut requests per search from about one per letter to one or two. Each request gets its own AbortController, and starting a new one aborts the last, so a slow old response can't overwrite a newer one. As a second guard, the server echoes the query. On the server, product names have a pg_trgm GIN index, so partial words match quickly, and LIKE wildcards in the input are escaped. I chose trigrams over full-text search because shoppers type fragments of short names. For long descriptions, full-text search would be better."

## Stretch goals

- Highlight the matching part of each product name in the results.
- Fall back to `similarity()` matches when `ILIKE` finds nothing, so "hoddie" still finds hoodies.
- Log searches that return zero results (without any personal data) and show the top ones on the admin dashboard.
