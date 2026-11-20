---
id: webhooks-orders
project: storefront
title: Webhook-driven order lifecycle
summary: >-
  Make Stripe's checkout.session.completed webhook the only thing that marks an order paid. Verify its signature, make the handler safe to receive twice, and mark the order paid and decrement stock in one transaction.
time: 6-8 hours
doneWhen:
  - Paying and closing the tab before Stripe redirects still gives you a paid order and lower stock
  - Delivering the same event twice leaves the order and stock unchanged the second time, and your log says it was a duplicate
  - A POST to the webhook with a missing or wrong Stripe-Signature header gets a 400 and changes nothing
  - Throwing an error on purpose after marking the order paid but before the stock update saves neither change, and delivering the event again afterwards fulfils it fully
  - The success page only reads the order's status and turns from "confirming" to "paid" on its own
  - An expired Checkout Session moves its pending order to cancelled
docs:
  - label: "Stripe: webhooks"
    url: https://docs.stripe.com/webhooks
  - label: "Stripe: fulfil Checkout orders"
    url: https://docs.stripe.com/checkout/fulfillment
  - label: "Stripe CLI"
    url: https://docs.stripe.com/stripe-cli
  - label: "Stripe API: event types"
    url: https://docs.stripe.com/api/events/types
  - label: "PostgreSQL: transactions"
    url: https://www.postgresql.org/docs/current/tutorial-transactions.html
---

## What you're building

An endpoint, `POST /api/webhooks/stripe`, that Stripe calls when a payment completes. Your handler checks the `checkout.session.completed` event really came from Stripe, finds the order from the `orderId` in metadata, and in one transaction marks it `paid`, lowers stock and clears the cart. If the same event arrives again, it does nothing.

The success page says "Confirming your payment..." and, a moment later, "Paid. Order LP-1042." If the shopper closed the tab first, the order is paid anyway.

## Why it matters

A redirect is a courtesy. A webhook is a guarantee, because Stripe keeps retrying it until your server says yes. Retries mean duplicates, so the handler has to be **idempotent**, meaning running it twice has the same effect as running it once. That pattern sits behind many system-design interview questions.

## Before you start

- **Webhooks.** An HTTP request another service sends your server when something happens. Your endpoint is public, so anyone can POST to it.
- **Signature verification.** Stripe signs each request with a shared secret and puts the result in the `Stripe-Signature` header. `stripe.webhooks.constructEvent(rawBody, signature, secret)` recomputes it and throws if it doesn't match. It needs the **raw** request body, exactly as sent.
- **Retries.** If your endpoint doesn't return a 2xx status, Stripe retries with growing gaps, for up to three days in live mode. Return 2xx only once the work is saved.
- **Idempotency.** Every Stripe event has a unique id like `evt_1Q...`. Record each processed id in the same transaction as the work, and a repeat finds it and skips.
- **Transactions.** Statements between `BEGIN` and `COMMIT` all happen or none do, so you never get "paid but stock not reduced".

## Build it step by step

### Step 1: Forward webhooks to your laptop with the Stripe CLI

Stripe can't reach `localhost`, so the Stripe CLI receives events for you and forwards them. Install it from the CLI docs, then:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# prints: Ready! Your webhook signing secret is whsec_...
```

Put that value in `.env.local` as `STRIPE_WEBHOOK_SECRET`. A deployed endpoint, created in the Dashboard, has a different secret.

Check it: keep `stripe listen` running and make a test purchase. The CLI prints `checkout.session.completed` followed by a status, probably 404 because your route doesn't exist yet.

### Step 2: Verify the signature on the raw body

Create `app/api/webhooks/stripe/route.ts` with a `POST` handler. Read the body with `await request.text()`, not `request.json()`, and the header with `request.headers.get("stripe-signature")`. Pass both and the secret to `constructEvent`. If it throws, return 400 and stop. If it succeeds, log the event type and id and return 200.

If you have auth middleware from Project 3, exclude `/api/webhooks` from its `matcher`, or it will redirect Stripe to your sign-in page.

Check it: a test purchase shows `[200]` in the CLI. A `curl -X POST` to the route with a made-up body gets 400.

### Step 3: Record processed events

Add a `stripe_events` table: `id` (the event id, primary key), `type` and `received_at`. The handler's transaction starts by inserting the event id with `ON CONFLICT (id) DO NOTHING`. No row inserted means a duplicate: log it and return 200.

The insert must be in the **same** transaction as the work. If you record the event first and then crash, the retry sees "already processed" and the order never gets paid. Committed together, a crash rolls back both.

Check it: insert the same id twice by hand in `psql` with `ON CONFLICT DO NOTHING`. The second reports `INSERT 0 0`.

### Step 4: Fulfil the order in one transaction

For `checkout.session.completed`, read `session.metadata.orderId`. Then do all of this inside one transaction:

```text
insert event id into stripe_events; if duplicate: stop, return 200
order = select order by id; if missing: log it, return 200
if session.payment_status != "paid": stop (wait for the async event)
if session.amount_total != order.total: flag order for review
update orders set status = 'paid', paid_at = now()
       where id = :orderId and status = 'pending'
if 0 rows updated: already handled, stop
for each line: update variants set stock = stock - :qty
               where id = :variantId and stock >= :qty
    if 0 rows: flag the order "oversold" (money is taken; don't undo paid)
delete the cart's items (store cart_id on the order at checkout)
commit, then return 200
```

The conditional `where status = 'pending'` is a second idempotency guard. The conditional stock update stops two buyers of the last hoodie pushing stock below zero, with your `CHECK` as the backstop. If a line is oversold, don't undo the payment: flag the order for the admin to refund or restock.

Return 200 for events you don't handle, and for orders you can't find (such as those created by `stripe trigger`).

Check it: buy two hoodies that have 5 in stock. In `psql`, the order is `paid` with a `paid_at`, stock is 3, and the cart is empty.

### Step 5: Cancel expired sessions

A shopper who never pays leaves a `pending` order behind. Handle `checkout.session.expired` by setting that order to `cancelled`, again only `where status = 'pending'`. Sessions expire after 24 hours by default, so expire one of your own test sessions early with `stripe checkout sessions expire <session id>` (see the CLI docs).

Some payment methods confirm later: the session completes with `payment_status` of `unpaid`, and `checkout.session.async_payment_succeeded` follows. Cards confirm immediately, so treating anything but `paid` as "wait" is enough here.

Check it: an expired session's order shows `cancelled`, and a later duplicate of the expiry event changes nothing.

### Step 6: Make the success page wait for the truth

The success page reads the order by session id. If it's `pending`, show "Confirming your payment" and refresh every two seconds (`router.refresh()` from a small Client Component), for about 20 seconds. Then switch to "This is taking longer than usual. We'll email you when it's confirmed." It never writes anything.

Check it: add a temporary five-second sleep in the webhook before it commits, then pay. The page shows "confirming", then flips to paid on its own.

### Step 7: Prove it under failure

Keep signature checking in the route and move the work into a `fulfilCheckout(event)` function, so you can test it directly with one saved event. **Duplicate:** call it twice with the same event. Nothing changes the second time. **Crash:** temporarily throw between the order update and the stock update. The order stays `pending`, and after you remove the throw, the same event fulfils it fully. **Closed tab:** pay and close the tab at once. The order is paid. Once deployed, register your endpoint in the Dashboard, where you can resend real deliveries and watch Stripe retry a failing one.

Check it: all three behave as described, and your logs show the duplicate being skipped.

## Common mistakes

- **Parsing the body before verifying.** Symptom: `No signatures found matching the expected signature for payload` on every request. Fix: verify `await request.text()`, then use the event `constructEvent` returns.
- **Recording the event id outside the transaction.** Symptom: after a crash, the retry is skipped as a duplicate and the order stays pending forever. Fix: insert the event id and do the work in one transaction.
- **Returning 500 for events you ignore.** Symptom: the Dashboard shows endless failed deliveries for `stripe trigger` or event types you don't handle. Fix: 200 for anything you deliberately skip.
- **Decrementing stock without a condition.** Symptom: two people buy the last item and stock goes to -1, or the constraint error makes every retry fail. Fix: `where stock >= qty`, and flag the order if it updates nothing.

## Say it in the interview

"The redirect only displays state. The webhook creates it. The handler verifies Stripe's signature on the raw body, then runs one transaction: insert the event id with `ON CONFLICT DO NOTHING`, flip the order from pending to paid with a conditional update, decrement stock with `where stock >= qty`, and clear the cart. Because the event id is recorded in the same transaction, a crash rolls everything back and Stripe's retry starts clean, while a duplicate delivery is a no-op. The tradeoff is that I decrement stock at payment, not at checkout, so two people can pay for the last item. I detect that and flag the order rather than block checkout with reservations."

## Stretch goals

- Handle `charge.refunded` so refunds made in the Dashboard set the order to `refunded` and restock the items.
- Reserve stock when the session is created and release it on expiry, and compare the tradeoffs.
