---
id: monitoring
project: storefront
title: Error monitoring and analytics
summary: >-
  Wire Sentry into the browser and the server before anyone else uses the shop, track exactly five analytics events that make up your sales funnel, and then break something on purpose to prove the alert reaches you.
time: 3-4 hours
doneWhen:
  - A deliberate error in a Client Component and one in a route handler both appear in Sentry, with stack traces pointing at your own source files
  - An alert rule notified you about the deliberate error by email or chat, and you saw the notification
  - Your analytics tool shows exactly five event types, view product, add to cart, begin checkout, purchase and search, and nothing else custom
  - The purchase event is sent from the webhook handler, so it's recorded even when the buyer closes the tab
  - No event contains an email address, a name or a full address
docs:
  - label: "Sentry: Next.js guide"
    url: https://docs.sentry.io/platforms/javascript/guides/nextjs/
  - label: "Sentry: alerts"
    url: https://docs.sentry.io/product/alerts/
  - label: "Sentry: source maps for Next.js"
    url: https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/
  - label: "Next.js: instrumentation"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
---

## What you're building

Two kinds of visibility into your live shop. **Error monitoring** with Sentry: when anything throws, in a shopper's browser or in your webhook handler, Sentry records it with a readable stack trace, the URL, the browser and the release, and an alert reaches you within minutes. **Product analytics** with PostHog: five events that together form your sales funnel, so you can see where shoppers give up, from viewing a product to paying for it.

It ends with you breaking the shop on purpose and watching the alert arrive.

## Why it matters

Without monitoring, your users find your bugs and most of them don't report them. They just leave. In a shop, an unnoticed error in the webhook means paid orders stuck as pending. Setting it up before launch, and proving it by breaking something, separates a demo from a system someone could run. Five chosen events also show judgement: you measured the funnel that answers a business question, instead of tracking every click.

## Before you start

- **Error monitoring.** An SDK in your app catches uncaught errors, plus anything you report by hand, and sends them to a service that groups repeats into "issues" and notifies you. Sentry's Next.js SDK covers the browser, the Node server and the edge runtime.
- **Source maps.** Your production JavaScript is minified, so stack traces show `a.js:1:20834`. Source maps translate that back to `ProductPage.jsx:42`. Sentry's build plugin uploads them during the build. You need an auth token for that, kept in your host's environment settings.
- **Analytics events.** An event is a name plus a few properties, such as `product_viewed` with `{ "productId": "...", "price": 149900 }`. A funnel is an ordered list of events, showing what share of people who did step 1 went on to do step 2, and so on.
- **Personal data.** Analytics should describe behaviour, not identify people. Don't put emails, names, phone numbers or addresses in event properties. Use your internal user id, or nothing.

## Build it step by step

### Step 1: Install Sentry with the wizard

Create a Sentry project for Next.js, then run the wizard from your project root.

```bash
npx @sentry/wizard@latest -i nextjs
```

It creates the client, server and edge config files and the `instrumentation` files Next.js uses to start the SDK on the server. It also wraps `next.config` to upload source maps. Then set `environment` (`development`, `preview` or `production`) so local noise doesn't page you, and keep the DSN and auth token in environment variables. Let the wizard set up its tunnel route if it offers one, because ad blockers often block requests to Sentry directly.

Check it: the wizard's example page throws a test error, and it shows up in your Sentry project.

### Step 2: Capture the errors that matter most

Uncaught errors are reported automatically. Your webhook is the exception, because it catches its own errors to return a 500. In its `catch`, call `Sentry.captureException(error)` with tags for the event type and order id, so "webhook failing for order LP-1042" is one search away. Do the same where the email send fails. For signed-in users, attach the internal user id with `Sentry.setUser({ id })`, and no email.

Check it: throw on purpose in the webhook (as in [the webhooks milestone](/development/storefront/webhooks-orders)) and deliver an event. The Sentry issue shows the `event_type` and `order_id` tags.

### Step 3: Set up an alert you will actually see

In Sentry, check the project's alert rules and make sure there is an issue alert for new issues in `production` that notifies you by email or connects to Slack or Discord. Keep it narrow: an alert that fires constantly gets ignored.

Check it: you know exactly where the notification will arrive, and notifications are switched on for that app on your phone.

### Step 4: Break it on purpose

Deploy, then break two things. Add a temporary button on a hidden admin page that throws in a Client Component. Then make a route handler throw, for example by pointing the search endpoint at a table name that doesn't exist. Trigger both on the deployed site.

Check it: both errors appear in Sentry with stack traces naming your real files and line numbers (source maps worked), and the alert reaches you. If either fails, fix the setup now, then remove the deliberate errors.

### Step 5: Add PostHog and choose exactly five events

Create a PostHog project and follow its [Next.js docs](https://posthog.com/docs) to install `posthog-js` in the browser, plus `posthog-node` on the server for the purchase event. Track these five events and nothing else custom:

```json
{ "product_viewed":  { "productId": "p_12", "price": 149900 },
  "added_to_cart":   { "variantId": "v_91", "quantity": 1, "price": 149900 },
  "checkout_started": { "orderId": "8c1e...", "total": 449700, "items": 3 },
  "purchase":        { "orderId": "8c1e...", "total": 449700 },
  "search":          { "queryLength": 6, "results": 4 } }
```

Fire the first three and `search` from the browser, at the moment the thing actually happens (on a successful add, not on the button click). Send the query's length rather than its text, unless you've decided search terms are safe to keep.

Check it: browse, add, search and start a checkout. PostHog's activity view shows exactly those events with the right properties.

### Step 6: Send `purchase` from the webhook

Purchases tracked on the success page miss everyone who closes the tab, and the whole project is built around not trusting that page. Send `purchase` from the webhook handler, after the transaction commits, using `posthog-node`. To link it to the same visitor, save the browser's PostHog distinct id on the order when checkout starts, and use it as the server event's `distinctId`. It's only analytics, so taking this one value from the client is fine. Send it once per order, guarded the same way as the confirmation email.

Check it: pay and close the tab immediately. A `purchase` event still appears, under the same person as that session's `checkout_started`.

### Step 7: Build the funnel

In PostHog, create a funnel insight: `product_viewed`, then `added_to_cart`, then `checkout_started`, then `purchase`. Make a few test journeys that stop at different steps.

Check it: the funnel's numbers match the journeys you made, and you can say which step loses the most people.

## Common mistakes

- **Minified stack traces.** Symptom: Sentry shows errors in `chunks/app/page-3f9a.js:1`. Fix: make sure source maps upload during the production build (check the build log), with the auth token set on your host.
- **Swallowed errors.** Symptom: webhook failures never appear in Sentry, because your `catch` returns 500 without reporting. Fix: `captureException` in every `catch` that doesn't rethrow.
- **Alerts for development errors.** Symptom: dozens of notifications from your own laptop, so you mute them all. Fix: set `environment`, and alert on `production` only.
- **Tracking everything.** Symptom: forty event types and no idea which ones matter. Fix: five events that form a funnel. Add a sixth only when it answers a specific question.
- **Personal data in events.** Symptom: customer emails sitting in your analytics tool. Fix: internal ids only, and review every `capture` call's properties.

## Say it in the interview

"Sentry covers the browser and the server, with source maps uploaded at build time, and the webhook reports its own caught errors with the order id as a tag. Before sharing the link I broke the shop on purpose, once in a component and once in an API route, and confirmed the alert reached my phone. For analytics I track five events that form the purchase funnel. The purchase event is sent from the webhook, not the success page, so it counts buyers who close the tab. The tradeoff of tracking so little is that some questions need a new event later, but every event I have gets looked at."

## Stretch goals

- Add a Sentry cron monitor, or an uptime check, that alerts you if no webhook has succeeded in a few hours while orders are being created.
- Add custom performance spans around checkout session creation and the webhook transaction, and find your slowest step.
