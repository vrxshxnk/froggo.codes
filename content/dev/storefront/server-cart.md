---
id: server-cart
project: storefront
title: Server-synced cart
summary: >-
  Store the cart in Postgres instead of the browser, keyed by a cookie for visitors and by user id after sign-in, merge the two by a rule you choose and document, and re-check price and stock on every read.
time: 5-6 hours
doneWhen:
  - Adding an item as a visitor, closing the browser and coming back still shows it
  - Signing in merges the visitor cart into your account cart using your documented rule, and the visitor cart no longer exists
  - Raising a variant's price in psql shows the new price in the cart on the next refresh
  - Dropping stock below the cart quantity shows a warning on that line and blocks checkout
  - Posting a negative quantity, a quantity of 500 or a made-up variant id to your cart API returns 400 and changes nothing
  - The cart cookie is HttpOnly and its value is a random UUID, not a number
docs:
  - label: "Next.js: cookies"
    url: https://nextjs.org/docs/app/api-reference/functions/cookies
  - label: "Next.js: route handlers"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/route
  - label: "MDN: Set-Cookie"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
  - label: "PostgreSQL: INSERT ... ON CONFLICT"
    url: https://www.postgresql.org/docs/current/sql-insert.html
  - label: "PostgreSQL: row locks"
    url: https://www.postgresql.org/docs/current/explicit-locking.html
---

## What you're building

A cart that lives on your server. A visitor adds "Pond Hoodie, Black, M" without signing in, closes the browser, and finds it still there tomorrow. When they sign in, those items join their account cart, which their phone sees too. Every time the cart is shown, it reflects today's prices and stock. If something sold out overnight, the line says so and checkout is blocked until they fix it.

## Why it matters

A cart in `localStorage` is a single-device toy holding prices the browser controls. A server cart is the first half of this project's rule: the client sends intentions ("variant X, quantity 2") and the server works out the consequences. The merge on sign-in has no single right answer. Deciding it on purpose and writing it down is the habit interviewers probe when they ask "what happens when...?"

## Before you start

- **Cookies set by the server.** A cookie with `HttpOnly` can't be read by JavaScript in the page, so a cross-site scripting bug can't steal it. `SameSite=Lax` keeps it off most cross-site requests, and `Secure` means HTTPS only. In Next.js you read cookies anywhere on the server with `cookies()`, but you can only **set** them in a route handler or a Server Action, not while a Server Component renders.
- **Upsert.** `INSERT ... ON CONFLICT (cart_id, variant_id) DO UPDATE` inserts a row, or updates it if one already exists for that key. That's how "add another hoodie" increases a quantity instead of creating a duplicate line.
- **Row locks.** `SELECT ... FOR UPDATE` inside a transaction locks the selected rows until the transaction ends. Other transactions wanting those rows wait, which is how you make a merge happen only once.
- **Re-validation.** The cart table stores only variant ids and quantities. Price, name and stock are joined in from the variants table every time the cart is read, so they're always current.

## Build it step by step

### Step 1: Create the cart tables

Two tables. `carts` has an `id` (a UUID), a nullable `user_id` that is unique when set (one cart per account), and timestamps. `cart_items` has `cart_id`, `variant_id` and `quantity`, with a primary key on `(cart_id, variant_id)` and a check that quantity is between 1 and a sensible maximum such as 10. Never store a price you'll charge. A `price_seen` column for a "price changed" warning is fine.

Check it: inserting the same variant twice into one cart fails with a primary key error, which is the error your upsert will rely on.

### Step 2: Write one `getCart()` function for every read

It finds the user's cart if they're signed in, otherwise the cart named by the `cart_id` cookie, then joins items to variants and products:

```json
{ "lines": [{ "variantId": "v_91", "sku": "HOOD-BLK-M", "name": "Pond Hoodie",
              "options": { "color": "Black", "size": "M" }, "quantity": 3,
              "unitPrice": 149900, "stock": 1,
              "issue": "only_1_left" }],
  "subtotal": 449700, "canCheckout": false }
```

Flag problems instead of silently changing quantities: `only_N_left`, `sold_out`, `price_changed`, `no_longer_available`. Set `canCheckout` to false while any line has a stock problem. The cart page, the header badge and checkout all call this one function.

Check it: set a carted variant's stock to 1 in `psql` and refresh. The line shows a warning and the checkout button is disabled.

### Step 3: Build the cart mutation routes

Write route handlers for adding, changing and removing a line, for example `POST /api/cart/items` and `PATCH` and `DELETE` on `/api/cart/items/[variantId]`. Each one validates the body with Zod (variant id is a UUID, quantity is an integer from 1 to 10), checks that the variant exists and is active, and then writes.

On the first add for a visitor with no cart, create a `carts` row and set the cookie in the same handler. The cookie value is the cart's random UUID. A sequential id would let anyone read another person's cart by guessing numbers.

```text
cart_id=3f2b...e91; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000
```

After a successful change, the client calls `router.refresh()` so Server Components (the cart page and the badge) render again from the database.

Check it: with `curl`, post `{"variantId":"not-a-uuid","quantity":-2}` to your add route. You get a 400 and nothing changes. Then post a valid add twice and the quantity goes to 2, still on one line.

### Step 4: Decide the merge rule and write it down

When a visitor with a cookie cart signs in and already has an account cart, you have two carts. You must decide what happens when both contain the same variant. The options include summing the quantities, keeping the larger one, or keeping the newer one.

A good default is **sum the quantities, capped at the line maximum and at available stock**, because the shopper deliberately added both. Whatever you pick, write it in your README as a decision with a reason, and make the code do exactly that.

Check it: you can state your rule in one sentence, and it covers "same variant in both carts" and "variant now sold out".

### Step 5: Merge safely, exactly once

Do the merge inside `getCart()` the first time it sees both a signed-in user and a visitor cart cookie. In one transaction:

```text
lock the visitor cart row (SELECT ... FOR UPDATE)
if it no longer exists: another request already merged it, stop
for each visitor line: upsert into the user cart, applying your rule
delete the visitor cart (its items go with it via ON DELETE CASCADE)
commit
```

The lock matters because a page often makes several requests at once. Without it, two can both merge and double every quantity. After the merge, the old cookie points at a cart that no longer exists. `getCart()` must treat that as "no visitor cart", and the next route handler that runs can delete the cookie.

Check it: add a hoodie as a visitor, add the same hoodie to your account cart in another browser, then sign in on the first one. You get the quantity your rule predicts, and refreshing five times doesn't change it.

### Step 6: Show price and stock changes clearly

On the cart page, render each line's `issue` as a short message next to it: "Only 1 left, reduce the quantity to continue" or "Price changed from ₹1,499 to ₹1,599". Offer a one-click fix, such as "Set to 1". Compute the subtotal on the server, from `getCart()`. The browser never adds up prices.

Check it: change a price in `psql`. The cart shows the new price, the notice, and a subtotal that matches the new price times the quantity.

## Common mistakes

- **Setting the cookie during a Server Component render.** Symptom: Next.js throws an error that cookies can only be modified in a Server Action or route handler. Fix: create the cart and set the cookie in the add-to-cart route.
- **Storing prices in the cart and trusting them later.** Symptom: an item added before a price rise checks out at the old price. Fix: the cart stores ids and quantities. Prices are joined in on every read.
- **No lock on merge.** Symptom: after signing in, some quantities are doubled, but only sometimes. Fix: lock the visitor cart in a transaction and delete it as part of the merge.
- **Validating on the client only.** Symptom: `curl` with `"quantity": 9999` succeeds. Fix: a Zod schema in every route, plus a `CHECK` constraint as the last line of defence.

## Say it in the interview

"The cart lives in Postgres. Visitors are tracked by an HttpOnly cookie holding a random UUID, and signed-in users by their user id. The cart stores only variant ids and quantities, so every read re-joins live price and stock and flags problems, and checkout is blocked while any line is short. On sign-in I merge the visitor cart by summing quantities, capped at stock. I wrote that rule down because there's no single right answer. The merge runs in a transaction with a row lock, because parallel requests were double-merging before I added it."

## Stretch goals

- Delete visitor carts untouched for 30 days with a scheduled job, such as a Vercel cron route.
- Write an integration test that runs two merges at the same time and asserts the quantities are right.
