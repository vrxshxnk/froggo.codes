---
title: "Project 5: Lilypad Market — What Money Does to Your Code"
excerpt: "The full build guide for Project 5 of our Development Roadmap. Catalog modeling, Stripe checkout, webhook-driven orders, idempotency — and why the redirect page is lying to you."
date: "2026-07-13"
author: "Froggo"
tags: ["projects", "roadmap", "payments", "stripe", "backend"]
featured: false
---

Up to now, a bug in your projects cost annoyance. A dropped chat message, a mis-sorted feed — bad, recoverable, forgotten. Lilypad Market is [Project 5 of the Development Roadmap](/development), and it introduces the thing that changes engineering culture wherever it appears: money. Charge a card without recording the order, sell stock you don't have, let a retried webhook create two orders from one payment — these bugs have dollar amounts and angry emails attached.

That's not a reason to be scared of this project. It's the reason to build it. "Has shipped payment flows" is one of the sharpest dividing lines on a junior resume, and the concepts underneath — consistency, idempotency, sources of truth — are the same ones FAANG interviews probe at scale.

## Variants own the money

Milestone 1 settles a modeling question that sinks more e-commerce codebases than any other: what owns the price?

The intuitive answer is the product. The correct answer is the **variant**. A t-shirt isn't a thing you can buy — "t-shirt, black, L" is. Size and color combinations have their own SKUs, their own stock counts, and often their own prices. Model price and stock on the product and you'll spend the rest of the build special-casing; model them on the variant and the product becomes what it really is — a grouping with a name and a description.

The second half of the milestone matters just as much: write a seed script with ~30 realistic products before building anything else. Every feature after this — filters, search, cart, checkout — is only testable against plausible data. Three products named "test" will hide every pagination bug, every empty-facet bug, every layout overflow until launch day. Realistic seed data is the cheapest QA you will ever buy.

## Filter state lives in the URL

Milestone 2's hint sounds like a technicality — put filter state in the query string, not component state — but it encodes a principle worth spelling out: **if a user would want to share, bookmark, or back-button their way to a view, that view's state belongs in the URL.**

`?category=hoodies&size=m&sort=price-asc` is a shareable link, a bookmarkable search, and a working back button, for free. Filters in component state give you none of those, and users notice — "I filtered, hit back, and lost everything" is one of the oldest UX complaints on the web. Every serious storefront you've used does it the URL way; now you'll know why.

On the server side, the same milestone quietly hands you a classic: building a WHERE clause dynamically from user-supplied query params. Validate every param against an allowlist before it touches the query. You know which principle this is by now — the client is a stranger.

## Never trust prices from the client

This rule gets its own section because a version of it appears in milestones 4, 5, and 6, and because getting it wrong is the canonical e-commerce security hole.

Here's the naive checkout: the client sends `{ items: [...], total: 149.99 }`, the server charges the total. The attack: open devtools, change the total to `1.49`, buy a laptop for pocket change. This exact vulnerability has shipped in real production stores more times than anyone will admit.

The rule: **the client sends intentions ("SKU X, quantity 2"); the server computes consequences.** Prices come from your database at the moment of checkout, never from the request. When you create the Stripe Checkout Session (milestone 5), build the line items from *the server's view of the cart* — and re-validate price and stock on every cart read too, because carts go stale: a shopper who added an item Tuesday and returns Friday should see Friday's price and Friday's stock, not a cached promise.

The cart itself (milestone 4) has a design decision hiding in it: anonymous visitors get a cookie-keyed cart, and on sign-in you merge it into their account cart. Sum the quantities? Keep the maximum? Prefer the newer? There's no universally right answer — what's wrong is not deciding. Pick one, write it down, implement exactly that. Learning to close small ambiguities with a documented decision instead of leaving them to whoever reads the code next is a senior habit with no prerequisite except noticing.

## The redirect is a lie; the webhook is the truth

This is the heart of the project. Milestone 6, and the single most important thing to understand about payment systems.

After a customer pays, Stripe redirects them to your success page. It is overwhelmingly tempting to fulfill the order there — you know they paid, they're right in front of you. **Do not.** The redirect is a courtesy, not a guarantee. Customers close tabs mid-redirect. Phones die. Wi-Fi drops between charge and redirect. In every one of those cases, the card was charged and your success page never ran — a paid order your system doesn't know about, discovered via a furious email.

The truth arrives on a different channel: the `checkout.session.completed` **webhook**, Stripe's server calling yours. It retries until you acknowledge it. It doesn't care about the customer's tab. The webhook handler — not the redirect page — is where the order flips to paid, stock decrements, and the confirmation email sends. The success page just reads and displays whatever state the webhook produced (or shows "processing..." if it hasn't landed yet — it's a race, and now you know who wins).

Three requirements inside that handler, each load-bearing:

**Verify the signature.** A webhook endpoint is a public URL. Without signature verification, anyone who finds it can POST a fake "payment completed" and receive free goods. Stripe signs every event; checking the signature is a few lines with their SDK and is not optional.

**Be idempotent, because webhooks retry.** Retries are a *feature* — they're what makes delivery reliable — but they mean your handler will sometimes run twice for one payment. Unguarded, that's two stock decrements and two confirmation emails per sale. Track processed event IDs (or make the state transition itself a no-op on repeat: `UPDATE orders SET status='paid' WHERE id=$1 AND status='pending'`) so the second delivery does nothing. This is why milestone 5's hint has you pass your internal order ID in the session's metadata — it's how the webhook finds *its* order.

**One transaction.** Mark paid, decrement stock — together or not at all. A crash between the two, without a transaction, leaves an order that's paid for items that were never reserved. Transactions exist for exactly this; this is the milestone where they stop being an abstract database feature and become the thing standing between you and inventory drift.

If you internalize this milestone, you already understand the shape of half of FAANG distributed-systems interviews: *unreliable delivery + retries + idempotent handlers* is the answer pattern to an enormous family of questions. You'll just have actually built it.

## Hiding the admin link is not authorization

Milestone 8, and the security boundary makes its final, starkest appearance. The admin dashboard must be gated by a role column checked *server-side on every admin query*. Not by hiding the nav link. Not by an `if (user.isAdmin)` around the frontend route. The frontend is a rumor about what the server enforces — anyone can request `/api/admin/orders` directly, and if the handler doesn't check the role, it's public.

Frontend gating for UX, server-side checks for security, always both, never only the first. If you take one sentence from this whole series into your career, that one earns its place.

Transactional emails (milestone 7) carry their own operational lesson: log every send. The first support question every store ever fields is "did the customer get their confirmation email?", and the difference between a two-minute answer and an unanswerable shrug is whether you logged it.

## Monitoring goes in before the first user, not after the first incident

The last two milestones — debounced instant search with `AbortController` (cancel stale requests, or fast typers get answers to questions they've stopped asking), and error monitoring — end the project on the right professional note.

Wire Sentry (or any equivalent) for client *and* server before you share the link, and track five analytics events, maximum: view product, add to cart, begin checkout, purchase, search. Five is a discipline, not a limitation — teams that track everything look at nothing, and those five form the conversion funnel that answers the only question that matters: *where do people give up?*

Then do the step from the hint that almost nobody does: break something on purpose and confirm the alert actually reaches you. Monitoring you haven't tested is a warm feeling, not a system. The difference between "we monitor errors" and "I broke prod deliberately and my phone buzzed" is the difference between hoping and knowing.

## What this project proves

Lilypad Market is proof you can build systems where consistency matters: server-computed prices, webhook-driven state, idempotent handlers, transactional inventory, role-checked admin paths. These are the same problems FAANG asks about at planetary scale — you've now solved them at store scale, which is how everyone who's good at them started.

---

**Ready to build it?** All ten milestones with hints are on the [Development Roadmap](/development) — free, sign in to track progress. Previously: [Project 4, Huddle](/blog/huddle-realtime-chat-guide). Next, the finale: [Project 6, Ripple](/blog/ripple-faang-capstone-guide) — a system-design interview answer that actually runs.
