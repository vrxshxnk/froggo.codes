---
id: admin-dashboard
project: storefront
title: "Admin dashboard: orders and inventory"
summary: >-
  Build a staff-only dashboard with three views (orders with status changes, inventory editing and revenue by day), protected by a role checked on the server in every admin query, not by a hidden link.
time: 5-6 hours
doneWhen:
  - Signed in as a normal user, calling an admin route directly with curl or fetch returns 403 or 404 and no data
  - An admin can move an order from paid to shipped, but can't move it back to pending or set it to paid by hand
  - A stock edit made while a sale happens doesn't wipe out the sale's decrement
  - The revenue view shows one row per day for the last 30 days, including zero-sale days, using Indian time
  - Every order status change is recorded with who made it and when
docs:
  - label: "Next.js: authentication and authorization"
    url: https://nextjs.org/docs/app/guides/authentication
  - label: "OWASP: Authorization Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
  - label: "Auth.js: role-based access control"
    url: https://authjs.dev/guides/role-based-access-control
  - label: "PostgreSQL: date/time functions"
    url: https://www.postgresql.org/docs/current/functions-datetime.html
  - label: "PostgreSQL: generate_series"
    url: https://www.postgresql.org/docs/current/functions-srf.html
---

## What you're building

An `/admin` area that only staff can use, with three views. **Orders** lists every order, newest first, filterable by status, with buttons to move an order along (paid to shipped, shipped to delivered) and a detail page showing its items, payment and email log. **Inventory** is a table of every variant with its SKU and stock, where you can add or remove stock and see what's running low. **Revenue** shows the last 30 days as one row per day: orders, units sold and revenue.

A normal user who guesses `/admin/orders` or calls `/api/admin/orders` gets nothing.

## Why it matters

Broken access control was ranked first in the OWASP Top 10 for 2021, and a common cause is exactly this: the admin link is hidden, but the server never checks who's asking. Checking a role on the server, in the code that reads the data, is the habit interviewers want to hear. The other views teach consistency again: status changes follow rules, and stock edits mustn't race with sales.

## Before you start

- **Authentication vs authorization.** Authentication asks "who are you?", which Auth.js answers. Authorization asks "are you allowed to do this?", which your code must answer on every request, for every protected action.
- **A data access layer.** Put every admin query in one module and make each function check the caller's role before touching the database. Then no page, route or Server Action can forget the check. The Next.js docs recommend this pattern.
- **Middleware is not enough.** Middleware can redirect non-admins away from `/admin` pages, which is nice for UX. It must not be your only check. In 2025, a Next.js vulnerability (CVE-2025-29927) let attackers skip middleware entirely with a crafted header, and apps that relied on it alone were exposed.
- **State machines.** An order's status can only move along allowed arrows. Writing those arrows down as data, and checking every change against them, stops impossible states like "delivered but never paid".

## Build it step by step

### Step 1: Add roles and a server-side check

Add a `role` column to `users`: text, `CHECK (role IN ('customer', 'admin'))`, default `'customer'`. Make yourself an admin with one `UPDATE` in `psql`.

Write a `requireAdmin()` function that gets the session, loads the user's role **from the database**, and throws a "forbidden" error unless it's `admin`. Reading the role fresh from the database, rather than trusting a role baked into a session token, means demoting someone takes effect immediately.

Check it: call `requireAdmin()` from a test route as yourself (allowed), then as a second test account (forbidden).

### Step 2: Put every admin query behind it

Create `lib/admin/` and put every admin read and write there: `listOrders`, `getOrder`, `changeOrderStatus`, `listVariants`, `adjustStock`, `revenueByDay`. Each one calls `requireAdmin()` first. Admin pages, route handlers and Server Actions only ever call these functions, never the database directly. Map the forbidden error to a 403 in routes, or `notFound()` on pages.

Add a middleware or layout redirect for non-admins too. That's for UX. The real check is in the data layer.

Check it: signed in as a normal user, `fetch("/api/admin/orders")` in the console returns 403, and the response body has no order data.

### Step 3: Build the orders view with allowed transitions

List orders with number, date, customer email, total and status, filterable by status through the URL as in [the listing milestone](/development/storefront/listing-filters). Write the allowed transitions down as data:

```json
{ "paid": ["shipped", "cancelled"],
  "shipped": ["delivered"],
  "pending": [], "delivered": [], "cancelled": [], "refunded": [] }
```

`changeOrderStatus(orderId, from, to)` checks that `to` is allowed from `from`, then runs `UPDATE ... WHERE id = :id AND status = :from`. If that updates no rows, someone else (another admin, or the webhook) changed it first, so tell the admin to refresh. Only the webhook sets `paid`, so `paid` appears in no list. In the same transaction, insert a row into an `order_events` table: order id, from, to, admin user id and time. Show those events on the order's detail page, next to the email log.

Show the webhook's flags, such as "oversold", prominently. Those orders need a human.

Check it: move an order from paid to shipped. Then try, via `curl`, to move it to `pending`. You get an error and nothing changes. The detail page shows one event with your name.

### Step 4: Build inventory editing that doesn't fight sales

List variants with product name, SKU, options and stock, with the lowest stock first. The trap is the edit. If the admin form loads "stock: 5", the admin types "15", and you save `stock = 15`, then any sale that happened in between is wiped out. Instead, save an **adjustment**: "received 10" becomes `stock = stock + 10`, and "remove 2 damaged" becomes `stock = stock - 2`. The database applies both atomically. If you want a "set to exact number" option, send the value the admin saw as well, and update only `WHERE stock = :seen`.

Record each adjustment (who, how much, why) in a `stock_adjustments` table, so you can explain stock that doesn't add up.

Check it: open the inventory page showing 5 for a variant, buy one in another browser, then add 10 in the admin. Stock ends at 14, not 15.

### Step 5: Build revenue by day

Write one query that returns the last 30 days with zero-filled gaps. In outline:

```text
days = generate_series(today_in_IST - 29 days, today_in_IST, 1 day)
sales = orders where status in (paid, shipped, delivered)
        grouped by date_trunc('day', paid_at at time zone 'Asia/Kolkata')
        summing total, counting orders
result = days LEFT JOIN sales, with missing days as 0
```

Two traps. Group in Indian time, not UTC, or an order paid at 2 a.m. IST counts towards the day before. And count paid orders by `paid_at`, not `created_at`. Keep amounts in paise until display. A plain table is enough, or bars sized with CSS widths.

Check it: make a test purchase. Today's row goes up by exactly that order's total, and yesterday's row is unchanged.

### Step 6: Test the boundary

Write one automated test (with Vitest, or a script) that signs in as a normal user and calls every admin route and Server Action, asserting each one refuses. Add every new admin function to this list.

Check it: the test passes, and it fails if you temporarily remove `requireAdmin()` from any one function.

## Common mistakes

- **Hiding the link and calling it security.** Symptom: any signed-in user can fetch `/api/admin/orders` from the console. Fix: `requireAdmin()` inside every admin data function.
- **Trusting a role stored in the session token.** Symptom: you demote someone, but they keep admin access until their session expires. Fix: read the role from the database on admin requests.
- **Setting stock to an absolute number.** Symptom: sales made while the admin page was open disappear from the count. Fix: relative adjustments, or a conditional update on the value the admin saw.
- **Free-form status updates.** Symptom: orders appear as "delivered" that were never paid. Fix: an allowed-transitions map and a conditional `WHERE status = :from`.
- **Grouping revenue in UTC.** Symptom: late-night orders land on the wrong day. Fix: `at time zone 'Asia/Kolkata'` before `date_trunc`.

## Say it in the interview

"Every admin query goes through a data access layer where each function calls `requireAdmin()`, which reads the role from the database. Middleware also redirects non-admins, but only for UX, since middleware alone has been bypassed before. Order statuses follow a transitions map and use conditional updates, so two admins or an admin and a webhook can't overwrite each other, and every change is logged. Stock edits are relative adjustments, because setting an absolute number would erase sales made while the page was open. The tradeoff of reading the role from the database is one extra query per admin request, which I accepted for instant revocation."

## Stretch goals

- Issue refunds from the order page through Stripe's Refunds API, and let the `charge.refunded` webhook update the status.
- Add a "staff" role that can ship orders but can't edit stock, and extend your boundary test to cover it.
