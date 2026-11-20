---
id: order-emails
project: storefront
title: Transactional emails
summary: >-
  Send an order confirmation from the webhook handler through Resend, build it from a template in your code, log every send attempt, and make sure a retried webhook never emails the customer twice.
time: 3-4 hours
doneWhen:
  - A test purchase delivers a confirmation email with the right order number, items, quantities and total
  - Every send attempt writes a row to your email log with its status and the provider's message id
  - Delivering the same webhook event twice sends only one confirmation
  - With a broken API key, the failure is logged, and after you fix the key the next delivery sends the email once
  - The template is a function in your repo that takes an order, with no hard-coded items or prices
docs:
  - label: "Resend: send with Next.js"
    url: https://resend.com/docs/send-with-nextjs
  - label: "Resend: send email API"
    url: https://resend.com/docs/api-reference/emails/send-email
  - label: "Postmark: developer docs"
    url: https://postmarkapp.com/developer
  - label: "MDN: Intl.NumberFormat"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
---

## What you're building

A minute after a test purchase, the customer's inbox has an email titled "Your Lilypad Market order LP-1042". It lists each item with its options, quantity and price, the total, and a link to view the order. It looks right in Gmail on a phone, and it has a plain-text version for clients that don't show HTML.

Behind it is an `email_log` table with one row per send attempt: which order, which email type, who it went to, whether it worked, and the provider's message id. When someone asks "did I get my confirmation?", you can answer in ten seconds.

## Why it matters

Transactional emails are the messages a user triggers by doing something, like a receipt or a password reset. They're part of the product, and customers treat a missing receipt as a missing order. Sending one from a retried webhook is also a neat test of the idempotency you built last milestone. The database step was easy to make a no-op. An email, once sent, can't be unsent. Logging every send is the operations habit support teams depend on.

## Before you start

- **Transactional email providers.** Services such as Resend and Postmark send email through an API and handle the delivery reputation that decides whether you land in the inbox or in spam.
- **Sending domains.** To send from your own domain, you add DNS records (SPF and DKIM) that prove you own it. Until you verify a domain, Resend lets you send from its test address only to your own account's email, which is fine for development.
- **Templates in code.** The email is a function that takes an order and returns a subject, an HTML body and a text body. In the repo, it's versioned and tested like any code.
- **At-most-once vs at-least-once.** A send can fail in a way where you can't tell whether the email went out (a timeout, say). You must choose: risk a duplicate by retrying, or risk no email by not retrying. For receipts, a rare duplicate is better than silence.

## Build it step by step

### Step 1: Set up the provider

Create a Resend account and an API key, and install the SDK. Keep the key server-only.

```bash
npm install resend
# .env.local
RESEND_API_KEY=re_...replace_me
EMAIL_FROM="Lilypad Market <onboarding@resend.dev>"
```

Until you verify a domain, send only to the email address on your Resend account. If you have a domain, add Resend's DNS records and switch `EMAIL_FROM` to an address on it.

Check it: send one email to yourself from a throwaway script or route with `resend.emails.send({ from, to, subject, text })`. It arrives, and appears in Resend's dashboard.

### Step 2: Write the template as a function

Create `emails/orderConfirmation.ts` exporting a function that takes an order with its items and returns `{ subject, html, text }`. Format money with `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })` on the paise value divided by 100, in this one place.

Email HTML is not web HTML. Use simple tables and inline styles, keep it under about 600 pixels wide, and don't rely on external CSS or JavaScript. Escape anything that came from a user, such as a customer's name from Stripe, before putting it into HTML. React Email is a fine alternative if you prefer components.

Check it: call the function with a sample order in a script and open the HTML in a browser. Every item, quantity and the total are right, and the text version reads cleanly on its own.

### Step 3: Add the email log

Create `email_log` with `id`, `order_id`, `type` (such as `order_confirmation`), `to_address`, `status` (`sent` or `failed`), `provider_message_id`, `error`, and `created_at`. Add a partial unique index on `(order_id, type) WHERE status = 'sent'`, so the database itself refuses a second successful confirmation for one order, while failed attempts can pile up as history.

Check it: in `psql`, two `sent` rows for the same order and type fail on the index, while two `failed` rows are allowed.

### Step 4: Send from the webhook, after the transaction commits

In your webhook handler, after the fulfilment transaction commits, call a `sendOrderConfirmation(orderId)` function. Never send inside the transaction. If the transaction rolled back after an email went out, the customer would get a receipt for an order that doesn't exist.

```text
if email_log has a 'sent' row for (order, 'order_confirmation'): return
build { subject, html, text } from the order
send via the provider (with an idempotency key if it supports one)
on success: insert log row, status 'sent', provider message id
on failure: insert log row, status 'failed', error text; throw
```

The first check is what stops a retried webhook emailing twice. Note that your fulfilment step returns early on a duplicate event. Call `sendOrderConfirmation` after it either way, for duplicates too, so an email that failed the first time gets another chance on the retry.

Check it: make a test purchase. One email arrives, and `email_log` has one `sent` row with a message id.

### Step 5: Decide what a failed send does

If the send fails, should the webhook return 500 so Stripe retries? Recommended: yes. The order is already paid and committed, so the retry skips fulfilment as a duplicate and only retries the email. The cost is rare: if the provider accepted the email but your log insert failed, the retry sends it again. That's an acceptable duplicate receipt. If your provider supports idempotency keys, pass something like `order-confirmation/<orderId>` and even that case goes away. Write the decision in your README.

Check it: set `RESEND_API_KEY` to a wrong value and buy something. The order is paid, and `email_log` has a `failed` row with the error. Fix the key, deliver the event again (or call your fulfil function again with the same event, as in the last milestone), and exactly one email arrives.

### Step 6: Make the log useful

Add a way to read the log: a script for now, and a section on each order's admin page in the [admin milestone](/development/storefront/admin-dashboard). Show the time, recipient, status and error for each attempt. Add a "Resend confirmation" action there later, which deliberately bypasses the "already sent" check and is logged like any other send.

Check it: for any order number, you can answer "was the confirmation sent, when, and to which address?" without opening the provider's dashboard.

## Common mistakes

- **Sending on the success page.** Symptom: customers who closed the tab get no email, and those who refresh get two. Fix: send from the webhook only.
- **Sending inside the database transaction.** Symptom: a receipt for an order that a later error rolled back. Fix: commit first, then send.
- **No "already sent" check.** Symptom: every webhook retry or resend emails the customer again. Fix: check the log for a `sent` row first, with the partial unique index as a backstop.
- **Hard-coding the sender to an unverified domain.** Symptom: the provider rejects every send with a domain verification error. Fix: use the test sender until your domain is verified.
- **Formatting money in several places.** Symptom: the email says ₹149,900.00 while the site says ₹1,499.00. Fix: one formatting function, used by the site and the template.

## Say it in the interview

"Order confirmations are sent from the webhook after the fulfilment transaction commits, never inside it, so a rollback can't produce a receipt for an order that doesn't exist. Every attempt is logged with the provider's message id, and a partial unique index allows only one successful confirmation per order. If a send fails, I return 500 so Stripe retries. The order step is a no-op on the retry, so only the email is tried again. The tradeoff is a rare duplicate receipt if the provider accepted the send but my log write failed. I chose that over the risk of a customer getting nothing."

## Stretch goals

- Send a "Your order has shipped" email when the admin changes an order's status, through the same logged function.
- Handle the provider's delivery and bounce webhooks to record whether each email was delivered, not just accepted.
