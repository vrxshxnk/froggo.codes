---
id: listing-filters
project: storefront
title: Product listing with faceted filters
summary: >-
  Build the /products page with filters for category, size, colour, price and stock, keep every filter in the URL so links can be shared and the back button works, and show how many results each filter option would give.
time: 5-6 hours
doneWhen:
  - Choosing filters changes the URL, and pasting that URL into a private window shows exactly the same results
  - The back button undoes your last filter change
  - Each filter option shows a count, and clicking it gives exactly that many products
  - A URL with junk like ?size=XXL&sort=drop-table renders normally, ignoring the bad values instead of erroring
  - Filtering by Size M and Colour Black shows only products that have a variant that is both M and Black
docs:
  - label: "Next.js: page.js and searchParams"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/page
  - label: "Next.js: useSearchParams"
    url: https://nextjs.org/docs/app/api-reference/functions/use-search-params
  - label: "MDN: URLSearchParams"
    url: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  - label: "Drizzle: dynamic query building"
    url: https://orm.drizzle.team/docs/dynamic-query-building
  - label: "Zod"
    url: https://zod.dev
---

## What you're building

A `/products` page that shows a grid of product cards, each with a photo, a name and a "from ₹1,499" price. Down the side are filters: category, size, colour, a price range, "in stock only", and a sort menu. Next to every option is a number, such as "M (14)", telling the shopper how many products they'd see if they ticked it. Every click updates the URL, for example `/products?category=hoodies&size=M&sort=price-asc`. Copy that link to a friend and they see the same page. Press back and the last filter comes off.

## Why it matters

Filtering is where a lot of real-world SQL injection and "page crashes on a weird link" bugs come from, because user input flows straight into a query. Building the `WHERE` clause from allowlisted parameters shows you can carry untrusted input safely to the database. Keeping UI state in the URL shows you think about sharing and navigation, not just the first render.

## Before you start

- **Query strings.** Everything after `?` in a URL is a list of key-value pairs. `URLSearchParams` reads and writes them in the browser. A key can repeat (`?size=M&size=L`), which is how you represent several values for one filter.
- **`searchParams` in Next.js.** A page component in the App Router receives the URL's query as a `searchParams` prop. In Next.js 15 and later it's a promise, so you `await` it.
- **Allowlisting.** Don't try to spot bad input. Instead, define exactly what's allowed (these sizes, these sort keys, a price between 0 and 10,00,000 paise) and drop everything else. Zod lets you write that as a schema.
- **Facets.** A facet is one filter dimension, like size. A facet count says how many results you'd get for each value of it, given the other filters you've already chosen.
- **`EXISTS`.** This SQL keyword checks whether a subquery returns at least one row. "Products with at least one variant that is M, Black and in stock" is an `EXISTS` over variants.

## Build it step by step

### Step 1: Define the allowed filters as a schema

Write down every parameter your listing accepts and what's valid for each: `category` (a slug that exists), `size` and `color` (arrays of known values), `min` and `max` (integers in paise), `inStock` (`1` or absent), `sort` (one of `newest`, `price-asc`, `price-desc`), and `page` (a positive integer). Write a Zod schema that parses the raw search params into a clean filter object. For invalid values, drop them or fall back to a default. Don't throw, because a stale or hand-edited link should still show a page.

```json
{ "category": "hoodies", "sizes": ["M", "L"], "colors": [], "min": null,
  "max": 200000, "inStock": true, "sort": "price-asc", "page": 1 }
```

Check it: log the parsed object for `?size=M&size=XXL&sort=hack&page=-3`. You should get `sizes: ["M"]`, the default sort and page 1.

### Step 2: Build the WHERE clause from the parsed filters

In `app/products/page.jsx`, await `searchParams`, parse it, and pass the clean object to a `listProducts(filters)` function in your data layer. That function builds an array of conditions, adds one per active filter, and combines them with Drizzle's `and()`. Every value goes in as a bound parameter, never by gluing strings together.

The trap is the variant filters. Size, colour, price and stock must all be checked against the **same** variant, inside one `EXISTS`:

```text
products p
where p.category = :category                      (if set)
  and exists (select 1 from variants v
              where v.product_id = p.id
                and v.options->>'size'  in (:sizes)   (if set)
                and v.options->>'color' in (:colors)  (if set)
                and v.price between :min and :max     (if set)
                and v.stock > 0                       (if inStock))
```

If you join variants separately for each filter, a hoodie that comes in "White M" and "Black L" will wrongly appear for "Black M".

Check it: seed a product with exactly that variant pattern and filter for Black + M. It must not appear.

### Step 3: Sort from an allowlist, not from the URL

Map each allowed `sort` key to a fixed `ORDER BY` expression in your code. Price sorting uses the product's lowest variant price (`min(v.price)`). Always add a tiebreaker, such as the product id, so products with equal prices don't swap places between pages. The URL picks a key, and your code picks the SQL.

Check it: sort by price ascending and scan the "from" prices. They should never decrease as you go down the page, including across page 1 and page 2.

### Step 4: Paginate

Use `page` with a fixed page size, for example 24, and run a `count(*)` with the same conditions to show "Showing 25-48 of 61". Offset pagination is fine here. Project 3 needed cursors because new posts kept arriving. A catalog changes rarely, and shoppers like page numbers. When any filter changes, reset `page` to 1.

Check it: with a filter that matches 30 products, page 2 shows 6 products, and none of them were on page 1.

### Step 5: Compute the facet counts

For each facet, count matching products with **every other filter applied, but not that facet's own**. Otherwise, once you tick "M", every other size shows 0 and the shopper can't widen their search.

```text
for each facet F in [category, size, color]:
    filters_without_F = current filters minus F
    for each value x of F:
        count products matching filters_without_F AND F = x
```

You don't need one query per value. A single query per facet that groups by the value works (`group by v.options->>'size'`), but remember to count distinct products, not variants. Run the facet queries in parallel with `Promise.all`.

Check it: tick "M". The other sizes still show non-zero counts. Now untick M and tick a size showing "(9)": exactly 9 products appear.

### Step 6: Make the filter controls write to the URL

The filter sidebar is a small Client Component. On change, it copies the current params with `new URLSearchParams(searchParams.toString())`, sets or deletes the key, resets `page`, and calls `router.push(pathname + "?" + params)`. Use `push`, not `replace`, so each filter change is a step the back button can undo. Use real links (`next/link`) for things like category and pagination, so they work with JavaScript off and open in new tabs.

Don't keep a second copy of the filters in `useState`. The URL is the state. The page re-renders on the server with the new params, and the sidebar reads its checked boxes from `useSearchParams()`.

Check it: apply three filters, press back three times, and you're on the unfiltered page. Refresh at any point, and nothing changes.

## Common mistakes

- **Filters in component state.** Symptom: the back button leaves the page entirely, and shared links show the unfiltered catalog. Fix: the URL is the only source of filter state.
- **String-building SQL.** Symptom: `?sort=price;drop table` either crashes the page or, worse, runs. Fix: bound parameters for values, an allowlist map for sort keys and column names.
- **Separate variant joins per filter.** Symptom: "Black, M" shows a product that only has White M and Black L. Fix: one `EXISTS` over variants with every variant condition inside it.
- **Facet counts that include their own facet.** Symptom: ticking one size makes every other size show 0. Fix: exclude a facet's own filter when counting it.
- **Counting variants instead of products.** Symptom: "Black (27)" but only 9 products appear. Fix: `count(distinct p.id)`.

## Say it in the interview

"All filter state lives in the URL, so every view is shareable and the back button works. On the server, I parse the query string with a Zod schema that allowlists every value, then build the `WHERE` clause from bound parameters. Sorting maps a key to a fixed `ORDER BY`. The subtle bit was variant filters: size, colour and price all have to match the same variant, so they sit inside one `EXISTS`. Each facet count excludes its own filter. I chose offset pagination because the catalog rarely changes. With thousands of products, I'd move counts to a search index instead of running them live."

## Stretch goals

- Add a "Clear all" link and removable chips for each active filter, built purely from the URL.
- Show a loading state with `loading.jsx` while the server renders a new filter combination.
- Add a database index that helps your most common filter, and compare the query plan before and after with `EXPLAIN ANALYZE`.
