---
id: product-detail
project: storefront
title: Product page with variant selection
summary: >-
  Build the product page where shoppers pick a colour and size, the selection resolves to exactly one SKU before "Add to cart" turns on, sold-out combinations are disabled rather than hidden, and low stock shows from live data.
time: 3-4 hours
doneWhen:
  - Add to cart stays disabled until every option is chosen and the choice matches exactly one variant
  - A sold-out combination is still visible but greyed out, and clicking it does nothing
  - A variant with 2 in stock shows "Only 2 left"; one with 40 shows no number
  - Changing a variant's stock in psql and refreshing the page changes the message, with no rebuild
  - A product with a single variant can be added straight away, with no option pickers shown
docs:
  - label: "Next.js: dynamic routes"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
  - label: "Next.js: notFound"
    url: https://nextjs.org/docs/app/api-reference/functions/not-found
  - label: "Next.js: caching"
    url: https://nextjs.org/docs/app/guides/caching
  - label: "MDN: aria-disabled"
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled
---

## What you're building

The page at `/products/pond-hoodie`. It shows photos, the name, a description and the price. Below that are two rows of option buttons, Colour (Black, Moss, White) and Size (S, M, L). As the shopper picks, the price updates to that variant's price, sizes that don't exist in the chosen colour go grey, and "Only 2 left" appears when stock is low. "Add to cart" stays disabled until the selection points at exactly one SKU. The selection is in the URL (`?color=Black&size=M`), so a shopper can send their exact pick to a friend.

## Why it matters

The product page is where your data model meets the user. Turning a set of option choices into one SKU, and showing what's available as the shopper clicks, is a small state machine. It's also the first place stock reaches the screen, and you'll see why that number must be live, and why it's only a hint until the server checks again at checkout.

## Before you start

- **Dynamic routes.** A folder named `app/products/[slug]` matches any slug, and the page receives it in `params`. If the slug doesn't exist, call `notFound()` to return a real 404 rather than an empty page.
- **Resolving a variant.** The shopper picks one value per option name. The selected variant is the one whose `options` object matches every pick exactly. If no variant matches, or not every option is picked yet, there's no SKU and nothing can be added.
- **Disabled vs hidden.** Hiding sold-out sizes makes the row of buttons jump around and makes shoppers think the size never existed. Showing them disabled tells the truth: it exists, it's just not available.
- **Caching.** Next.js can cache rendered pages. That's great for descriptions and terrible for stock counts. If a database change doesn't show up after a refresh, the page is being served from a cache.

## Build it step by step

### Step 1: Load the product and all its variants on the server

In `app/products/[slug]/page.jsx`, look the product up by slug together with all its variants and images, in one or two queries. Call `notFound()` if it doesn't exist. Pass the client only what it needs: option names, each variant's id, options, price and stock.

Reading `searchParams` for the selection (step 3) makes this page render on every request, so stock is always fresh. If you ever find stale stock anyway, check the caching docs and opt this page out.

Check it: `/products/does-not-exist` shows your 404 page with a 404 status in the Network tab.

### Step 2: Work out which option values are available

This is the core logic. For each option value you're about to draw, ask: "If the shopper picked this, keeping their other picks, is there an in-stock variant?"

```text
for each option name N (e.g. "size"):
    for each value x of N (e.g. "M"):
        trial = current selection with N set to x
        matches = variants where every key in trial matches
        available = some variant in matches has stock > 0
        draw x always; disable it if not available
```

Write this as a pure function that takes variants and a selection and returns the availability of every value. Pure means data in, data out, with no React or fetching, so it's easy to test.

Check it: with Black chosen and Black L sold out, `L` comes back as unavailable while `S` and `M` stay available. Then choose White, and `L` becomes available again if White L has stock.

### Step 3: Keep the selection in the URL

Read the initial selection from `searchParams` (`?color=Black&size=M`), ignoring values that aren't real options. When the shopper clicks a value, update the URL with `router.replace(..., { scroll: false })`. Use `replace` here, not `push`. Ten clicks between sizes shouldn't mean ten presses of the back button to leave the page.

If a product has exactly one variant, pre-select it and don't draw pickers at all. If an option has only one value (every mug is "White"), pre-select that value too.

Check it: open `/products/pond-hoodie?color=Moss&size=S` in a new tab. Moss and S are already selected, and the price is that variant's price.

### Step 4: Resolve to exactly one SKU, and gate the button

Write a second pure function that returns the matching variant, or `null`, for a selection. Only when it returns a variant with stock above zero should "Add to cart" be enabled. Until then, show the price as "from ₹1,499" (the lowest variant price). After it resolves, show that variant's own price.

Use a real `disabled` attribute on the button so it can't be clicked or submitted. For option values, a disabled button is fine too. If you want screen readers to still announce sold-out values, use `aria-disabled="true"` and ignore clicks in your handler. In both cases, add "Sold out" to the accessible name.

Check it: click Black, then try to press "Add to cart" before picking a size. Nothing happens. Pick M and the button turns on.

### Step 5: Show stock honestly

Show a message only when it helps a decision: "Only 2 left" at 3 or fewer, "Sold out" at 0, and nothing above 3. Don't show "40 in stock": it adds nothing. Base it on the resolved variant's `stock` from the request you just served, never on a number stored in the browser.

For now, "Add to cart" can just log the variant id and quantity. The next milestone sends it to the server, where stock is checked again. This page's number can be out of date a second after it renders, and the server never trusts it.

Check it: in `psql`, set Black M's stock to 2 and refresh. "Only 2 left" appears. Set it to 0 and refresh. M is greyed out when Black is selected.

### Step 6: Polish the details that make it feel real

Swap the main image when the colour changes, if you seeded per-colour images. Reserve space for the stock message so the button doesn't jump when it appears. Set the page title with `generateMetadata`. On a phone, give option buttons touch targets of about 44 by 44 CSS pixels.

Check it: switch colours a few times on a narrow screen. Nothing below the pickers moves up and down.

## Common mistakes

- **Hiding unavailable values.** Symptom: the size row shrinks and grows as colours change, and shoppers ask whether you stock L at all. Fix: always draw every value, and disable the unavailable ones.
- **Enabling the button on a partial selection.** Symptom: "Add to cart" with only a colour chosen adds an arbitrary variant, or crashes. Fix: enable only when your resolve function returns exactly one in-stock variant.
- **Checking availability per option in isolation.** Symptom: L looks available because Moss L exists, but you have Black selected and Black L is sold out. Fix: always test a value together with the other current picks.
- **A cached page with stale stock.** Symptom: you set stock to 0 and the page still says "Only 2 left" until the next deploy. Fix: make sure the page renders per request, as in step 1.

## Say it in the interview

"Variant selection is two pure functions: one resolves a set of picks to exactly one variant or none, and one works out which values are still available given the other picks. Both are unit-tested without React. The button only enables when there's exactly one in-stock match. Sold-out values stay visible but disabled, because hiding them made the layout jump. Stock on this page is always from the current request, but I treat it as a hint. The cart and checkout check stock again on the server, because the number can be wrong a second after the page renders."

## Stretch goals

- Write unit tests for both pure functions with Vitest, including a product with three option names.
- Show "Notify me" for sold-out variants and store the request in a table, ready for the admin dashboard.
- Add JSON-LD `Product` structured data with the price and availability, so search engines can show it.
