---
id: stripe-checkout
project: storefront
title: Stripe Checkout in test mode
summary: >-
  Turn the server's view of the cart into a pending order and a Stripe Checkout Session, send the shopper to Stripe's hosted payment page, and bring them back, with every price taken from your database and your order id riding along in metadata.
time: 4-5 hours
doneWhen:
  - Paying with the test card 4242 4242 4242 4242 lands you on your own success page
  - The checkout request in the Network tab contains no prices or totals, only a request to check out
  - Editing a price in devtools before clicking Checkout makes no difference to the amount Stripe shows
  - Each checkout creates one pending order, and its id appears in the session's metadata in the Stripe Dashboard
  - Cancelling on Stripe's page brings you back to your cart with every item still in it
  - Your secret key is only in .env.local and your host's settings, and starts with sk_test_
docs:
  - label: "Stripe: Checkout overview"
    url: https://docs.stripe.com/payments/checkout
  - label: "Stripe API: create a Checkout Session"
    url: https://docs.stripe.com/api/checkout/sessions/create
  - label: "Stripe: metadata"
    url: https://docs.stripe.com/metadata
  - label: "Stripe: testing and test cards"
    url: https://docs.stripe.com/testing
  - label: "Stripe: API keys"
    url: https://docs.stripe.com/keys
---

## What you're building

A "Checkout" button on the cart page that takes you to a Stripe-hosted page showing your items and total. Type the test card `4242 4242 4242 4242`, any future expiry date and any three-digit CVC, and pay. Stripe sends you back to `/checkout/success`, which says "Thanks, we're confirming your payment." Click back on Stripe's page instead, and you're returned to your cart with nothing lost.

Behind the button, your server has written an order with status `pending` and copied each line's price from the database. The order isn't marked paid in this milestone. That's the webhook's job in [the next one](/development/storefront/webhooks-orders), and it's deliberate.

## Why it matters

This is where "never trust the client" stops being a slogan. The classic e-commerce hole is a checkout that charges whatever total the browser sends. Building the session from the server's cart, with prices read at the moment of checkout, closes it. You'll also learn the shape most payment providers share: your server creates a session, the provider handles the card, and the result comes back on a separate channel.

## Before you start

- **Test mode.** Every Stripe account has test API keys (`sk_test_...`, `pk_test_...`) that move no real money. The Dashboard may call test environments "sandboxes". Never use a key that starts with `sk_live_` in this project.
- **Checkout Session.** An object you create on your server that describes one payment: line items, currency, where to send the shopper afterwards. Stripe answers with a `url` for its hosted payment page. Card details go to Stripe, never to you, which keeps most card-security (PCI) work on Stripe's side.
- **`price_data`.** Line items can reference prices you created in Stripe, or describe the price inline with `price_data`. Inline keeps your database as the only catalog, so that's what you'll use.
- **Metadata.** Most Stripe objects accept `metadata`, a small set of your own key-value strings. Put your order id there so that, when Stripe tells you about this payment later, you know which order it belongs to.
- **Order snapshots.** An order line copies the name, SKU and unit price at purchase time, so old orders still show what the customer actually paid.

## Build it step by step

### Step 1: Set up keys and the SDK

Create a Stripe account, stay in test mode, and copy the secret key from the Dashboard's API keys page. Install the official package and keep the key in `.env.local`.

```bash
npm install stripe
# .env.local
STRIPE_SECRET_KEY=sk_test_51...replace_me
APP_URL=http://localhost:3000
```

Create the Stripe client once in a server-only module such as `lib/stripe.ts`, and import it only from server code. Add a startup check that throws if the key starts with `sk_live_`.

Check it: any simple SDK read from a temporary route returns without an authentication error.

### Step 2: Add the orders tables

Sketch `orders` and `order_items` before writing them. An order needs an `id`, a short human-readable `number` for emails (like `LP-1042`), a nullable `user_id`, the `cart_id` it came from, `email`, `status`, `currency`, `subtotal` and `total` in paise, a unique `stripe_session_id`, and `created_at` and `paid_at`. Order items copy `variant_id`, `sku`, `name`, `options`, `unit_price` and `quantity`.

Make `status` a text column with a `CHECK` of allowed values (`pending`, `paid`, `shipped`, `delivered`, `cancelled`, `refunded`), not a boolean `is_paid`.

Check it: you can describe "two hoodies at ₹1,499 and one mug at ₹399, unpaid" as one `orders` row and two `order_items` rows, with the total stored once.

### Step 3: Create the pending order from the server's cart

Write `POST /api/checkout`. The request needs no body: the cart is identified by the session or the cookie, as in [the cart milestone](/development/storefront/server-cart). Call `getCart()`. If it's empty or `canCheckout` is false, send the shopper back to the cart with an error. Otherwise, in one transaction, insert the order and its items, copying prices from `getCart()`'s live join, and compute the total on the server.

Use a plain HTML form that posts to this route, rather than `fetch`, so the redirect is simple. Disable the button after one click to avoid duplicate orders.

Check it: click Checkout with the Stripe step still missing. A `pending` order with the right lines and total appears in `psql`.

### Step 4: Create the Checkout Session

Still in the same route, after the order is saved, call `stripe.checkout.sessions.create()`. These are the parameters that matter, built from the order you just wrote:

```json
{ "mode": "payment",
  "line_items": [{ "quantity": 2, "price_data": { "currency": "inr", "unit_amount": 149900,
                   "product_data": { "name": "Pond Hoodie (Black, M)" } } }],
  "metadata": { "orderId": "8c1e...a4" },
  "client_reference_id": "8c1e...a4",
  "customer_email": "asha@example.com",
  "success_url": "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "http://localhost:3000/cart" }
```

`{CHECKOUT_SESSION_ID}` is written literally. Stripe replaces it with the real id when it redirects. Leave `customer_email` out for visitors and Stripe will ask. Consider also copying the order id into `payment_intent_data.metadata`, so it's on the payment itself when you look at refunds later.

Save the returned `session.id` on the order, then redirect the browser to `session.url` with a **303** status, which tells the browser to follow the redirect with a GET.

Check it: click Checkout. Stripe's page shows exactly your cart's lines and total. In the Dashboard, open the session and find your order id under metadata.

### Step 5: Build the success and cancel pages

`/checkout/success` reads `session_id` from the URL, finds the order with that `stripe_session_id`, and shows its number and items. If the status is still `pending`, say "We're confirming your payment" rather than "Paid". Don't call Stripe and mark the order paid here. Shoppers close tabs, and anyone can open this URL by hand. Only the webhook changes status.

The cancel URL is just your cart page. The order stays `pending`, and the cart is untouched because you never cleared it. Clear the cart only when the order becomes paid, in the next milestone.

Check it: pay with `4242 4242 4242 4242`. You land on the success page and the order is still `pending` in `psql`. That's correct for now.

### Step 6: Try the unhappy paths

Use Stripe's test cards: `4000 0000 0000 0002` is declined, and `4000 0025 0000 3155` asks for 3D Secure authentication. A decline should leave the shopper on Stripe's page with an error and the order pending. Then edit a price in the cart page with devtools and check out: Stripe still shows the database price.

Check it: in the Network tab, the request to `/api/checkout` has no price, total or quantity in its body.

## Common mistakes

- **Taking prices or totals from the request.** Symptom: editing the page or the request changes what Stripe charges. Fix: the route reads the cart from the database and sends Stripe only server-computed amounts.
- **Amounts in rupees instead of paise.** Symptom: a ₹1,499 hoodie shows as ₹14.99, or Stripe rejects a decimal. Fix: `unit_amount` is an integer in the smallest unit, which your schema already stores.
- **Marking the order paid on the success page.** Symptom: it works in every demo, then a shopper who closed the tab is charged with no order recorded. Fix: the success page only reads status. The webhook writes it.
- **Forgetting `{CHECKOUT_SESSION_ID}` in the success URL.** Symptom: the success page can't tell which order to show. Fix: include it literally, and look the order up by session id.

## Say it in the interview

"The checkout button posts nothing but intent. The server reads the cart from Postgres, re-checks stock, and writes a pending order that snapshots each unit price. It then builds the Stripe Checkout Session from that order with `price_data`, so Stripe never sees a price the browser could have changed. The order id goes in metadata so the webhook can find it. I used Stripe's hosted page instead of a custom card form. The tradeoff is less control over the design, but card data never touches my server."

## Stretch goals

- Collect a shipping address on Stripe's page with `shipping_address_collection`, and copy it onto the order in the webhook.
- Set a shorter `expires_at` on sessions, so abandoned pending orders get cancelled sooner by the expiry webhook.
