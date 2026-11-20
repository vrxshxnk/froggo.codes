---
id: storefront
name: Lilypad Market
tagline: A storefront with variants, a real cart, Stripe and webhook orders
summary: >-
  Build a small online shop with a catalog, a server-side cart, Stripe Checkout in test mode and webhook-driven orders, and learn what changes when every bug has a price on it.
time: About 2 weeks, 35-45 hours
---

## What you're building

Lilypad Market is a small online shop that sells hoodies, mugs, stickers and notebooks. A shopper browses a catalog of about 30 products, narrows it with filters such as size, colour and price, and picks a variant ("Hoodie, Black, M") on the product page. They add it to a cart that follows them from their phone to their laptop once they sign in. Then they pay on Stripe's hosted checkout page with a test card. A minute later a confirmation email arrives, the stock count has gone down, and the order shows up on an admin dashboard where you can mark it shipped.

Everything runs in Stripe's **test mode**, so no real money moves, but the code is what a real shop would run. The hard parts are invisible on screen: who decides the price, what happens when a payment notification arrives twice, and who gets the last hoodie when two people buy it at once.

## Features

- A catalog where each product has variants, and each variant owns its price, SKU and stock
- A product listing with filters and per-filter result counts, all kept in the URL
- A product page where you pick options, out-of-stock combinations are disabled, and low stock shows "Only 2 left"
- A cart stored on the server, kept by a cookie for visitors and merged into the account on sign-in
- Stripe Checkout in test mode, with every price taken from your database
- Orders that become paid only when Stripe's webhook says so, with stock decremented in the same transaction
- Order confirmation emails, with every send logged
- An admin dashboard for orders, inventory and revenue by day, protected on the server
- Instant search with debouncing and cancelled stale requests
- Error monitoring and five analytics events, tested by breaking something on purpose

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| Framework | Next.js App Router | The same setup as [Project 3](/development/fullstack-platform). Pages are Server Components that read the database directly. Route handlers serve the cart, checkout, webhook and search. Express plus React also works, with more glue. |
| Database | Postgres (Neon or Supabase) | This project is about transactions, constraints and reports, and Postgres does all three well. Firestore has transactions too, but faceted counts and revenue reports are awkward in it. |
| Database access | Drizzle ORM | It reads like SQL, so conditional updates and dynamic `WHERE` clauses stay visible. Prisma is fine if you used it in Project 3. |
| Validation | Zod | Every query string and request body is checked against a schema before it reaches the database. |
| Auth | Auth.js, from Project 3, plus a `role` column | Accounts are needed for cart merging and the admin dashboard. |
| Payments | Stripe Checkout (hosted page), the `stripe` npm package and the Stripe CLI | Stripe hosts the card form, so card numbers never touch your server. The CLI forwards webhooks to your laptop. |
| Email | Resend | A simple API and a dashboard of every send. Postmark is the common alternative. |
| Monitoring | Sentry, plus PostHog for analytics | PostHog does funnels. Vercel Web Analytics is a simpler alternative. |
| Hosting | Vercel | Webhooks are short requests, so serverless hosting suits them. |

Many Indian shops use Razorpay instead of Stripe. Its orders, payment signatures and webhooks follow the same ideas, so what you learn here carries over. See the [Razorpay docs](https://razorpay.com/docs/). Every guide in this project uses Stripe.

## How it fits together

```text
 browser ── pages (Server Components) ──────────────► Postgres
    │                                                   ▲
    │ POST /api/checkout                                │
    ▼                                                   │
 route handler: read cart from DB, create order ────────┤ order: pending
    │   create Checkout Session (DB prices, orderId)    │
    ▼                                                   │
 Stripe's hosted checkout page: customer pays           │
    │                          │                        │
    │ redirect (unreliable)    │ webhook (retried)      │
    ▼                          ▼                        │
 /checkout/success        POST /api/webhooks/stripe     │
 reads order status       verify signature ─────────────┘
                          one transaction: record event,
                          mark paid, decrement stock
                          then send email, log it
```

Follow one purchase. The shopper clicks "Checkout", and the browser sends no prices. Your route handler reads the cart from Postgres, checks stock, and writes an order with status `pending`, copying each line's price from the variants table. It asks Stripe for a Checkout Session built from those prices, with the order's id in `metadata`, and redirects the browser to Stripe. The shopper pays. Two things now happen independently. Stripe redirects the browser back to your success page, and Stripe's servers POST a `checkout.session.completed` event to your webhook. The webhook checks Stripe's signature. Then, in one transaction, it records that it has seen this event, flips the order to `paid`, and decrements stock. After that it sends the email. The success page only reads the order's status. If the shopper closed the tab, nothing is lost, because the webhook never depended on the tab.

## Out of scope

- **Live payments.** Test mode teaches everything. Going live means verifying your identity and business details with Stripe, and taking responsibility for real customers' money.
- **Shipping rates, tax and coupons.** Each one is a rules engine of its own. Use one flat shipping price and say so.
- **Building your own card form.** Stripe Checkout handles cards, 3D Secure and receipts. A custom form with Stripe Elements is a stretch goal for later, not this project.
- **Multiple sellers, reviews or wishlists.** More CRUD, nothing new about money.
- **Elasticsearch or Algolia.** Postgres search is plenty for a catalog of 30 products, or 3,000.

## How to work through it

1. **The catalog** ([catalog model](/development/storefront/catalog-model), [listing and filters](/development/storefront/listing-filters), [product page](/development/storefront/product-detail)): about 12 hours. Slow down on the data model. Every later milestone depends on variants owning the price.
2. **The money path** ([server cart](/development/storefront/server-cart), [Stripe Checkout](/development/storefront/stripe-checkout), [webhooks and orders](/development/storefront/webhooks-orders), [emails](/development/storefront/order-emails)): about 16 hours. This is the heart of the project. Do them in order, and test failures, not just the happy path.
3. **Running the shop** ([admin dashboard](/development/storefront/admin-dashboard), [search](/development/storefront/store-search), [monitoring](/development/storefront/monitoring)): about 12 hours.

The rule that matters most: **the client sends intentions, the server computes consequences.** The browser may say "variant X, quantity 2". It never says what that costs, whether it's in stock, or whether the order is paid. Every price comes from your database and every "paid" comes from a verified webhook.

## Show it off

Your README should include:

- A diagram of the checkout and webhook flow, like the one above, in your own words
- Your schema for products, variants, orders and processed events, with one sentence on why the variant owns the price
- Your cart-merge rule, written as a decision with the reason
- How you made the webhook idempotent (safe to receive twice), and how you tested it
- A test-mode note with the test card number for visitors

In your demo, buy something and close the tab on Stripe's page right after paying. Then open the admin dashboard and show the order marked paid and the stock reduced anyway. Then resend the same webhook from the Stripe CLI and show that nothing changes.

Resume bullets to adapt (use your own numbers):

- "Built a Next.js and Postgres storefront with Stripe Checkout where orders are confirmed only by signature-verified, idempotent webhooks, so replaying N duplicate events produced 0 duplicate orders or stock changes"
- "Cut search requests per query from X to Y with a 250 ms debounce and AbortController cancellation, keeping results in the dropdown under Z ms at p95"
