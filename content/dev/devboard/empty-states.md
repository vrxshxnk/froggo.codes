---
id: empty-states
project: devboard
title: "Polish: empty states, transitions, favicon"
summary: >-
  Give empty columns and empty search results a helpful message, animate card moves in about 150 ms, and add a favicon and title. These small details are what people notice first and screenshot.
time: About 2 hours
doneWhen:
  - An empty column says what to do ("Drop tasks here or press +") and still accepts a dropped card
  - A search with no results says so and offers a way to clear it, which is different from the empty-column message
  - Moving a card animates it to its new place in roughly 150 ms, and typing in the search box does not animate anything
  - With "reduce motion" turned on in your OS settings, cards move instantly
  - The browser tab shows your favicon and a real page title, on the deployed site as well as locally
docs:
  - label: "MDN: View Transition API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
  - label: "MDN: CSS transition"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/transition
  - label: "MDN: prefers-reduced-motion"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
  - label: "MDN: The link element (rel=icon)"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
  - label: "MDN: scroll-snap-type"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type
---

## What you're building

Clear out a column and, instead of a blank strip, you see a dashed outline and "No tasks yet. Drop one here or press +." Search for something that doesn't exist and the board says "No tasks match 'xyz'", with a button to clear it. Move a card and it glides to its new spot in about 150 milliseconds instead of jumping. The browser tab shows a small icon and your app's name.

None of this changes what the board can do, only how it feels.

## Why it matters

The first screen a new user sees is often an empty one. A blank column looks broken; a column that says what to do looks designed. Smooth movement helps people follow what changed when cards rearrange. Anyone who opens your project notices this finish quickly. It's also a lesson in restraint: polish should be short, respect user settings and never get in the way.

## Before you start

- **Empty states.** What the UI shows when there's nothing to show. A good one says why it's empty and what to do next. "Nothing exists yet" and "a filter hid everything" need different messages.
- **CSS transitions.** `transition: background-color 150ms ease` tells the browser to animate a property when it changes. This works for hover and focus styles. It doesn't animate a card that render deleted and recreated somewhere else, because to the browser the new card has no "before".
- **The View Transition API.** `document.startViewTransition(callback)` captures the page, runs your callback (your render), then animates from old to new. Elements with the same `view-transition-name` before and after animate as one moving object, which fits re-rendering perfectly. Browser support is still growing, so check MDN's compatibility table and feature-detect it.
- **Reduced motion.** Some people feel unwell from on-screen motion and turn on "reduce motion" in their OS. The media query `prefers-reduced-motion: reduce` (and `matchMedia` in JavaScript) tells you, so you can switch animations off.

## Build it step by step

### Step 1: Write the empty-column state

In `renderColumn`, when a column has no tasks at all, draw "No tasks yet. Drop one here or press +." in the list's place, with a dashed border so it reads as a space waiting to be filled.

Two details. Give the column's list a `min-height` of about one card, so an empty column is still a decent drop target. And keep the message inside the element with `data-column-id`, so dragging over the message counts as dragging over the column.

Check it: move every card out of In Progress. The message appears, and you can drag a card straight back in.

### Step 2: Separate "empty" from "filtered to nothing"

When a column has tasks but `matches` hid them all, say "Nothing here matches your filters." When the whole board shows nothing because of a search, show one message above it: "No tasks match 'xyz'", with a Clear search button that resets `view.query` and `view.priority` through `update`. It must also clear the search input's value, since that input lives outside render.

Render decides all of this from state you already have: `taskIds.length` for "really empty", the filtered list's length for "hidden".

Check it: search for "zzzz". You see the no-results message, not three "No tasks yet" columns. Click Clear search and everything comes back.

### Step 3: Animate card moves with view transitions

In `renderCard`, give each card a unique `view-transition-name` through its inline style, built from its id with a prefix, like `card-` followed by the UUID. The prefix isn't optional: names must be valid CSS identifiers, and an identifier can't start with a digit, which more than half of your UUIDs do.

Then, in `update`, when the board actually changed (you compute this for undo already), render inside `document.startViewTransition` if the browser has it, and normally if not:

```javascript
if (boardChanged && document.startViewTransition) document.startViewTransition(() => render(state));
else render(state);
```

Set the animation length in CSS on the `::view-transition-group(*)` pseudo-element, to about 150 ms. Your focus-restoring code from the keyboard milestone must run inside the callback, after render, or focus is restored to elements that are about to be replaced.

Only board changes animate. Search changes only `view`, so it renders instantly; animating keystrokes would make it feel slow.

Check it: drag a card from To Do to Done. It slides across instead of jumping. Type in the search box: cards appear and disappear instantly.

The classic alternative is the FLIP technique: measure each card's position before and after render, then animate the difference with a CSS transform. It's more code, and works everywhere.

### Step 4: Respect reduced motion

Add a `prefers-reduced-motion: reduce` media query that turns your view-transition animations and CSS transitions off, or down to a near-instant fade. Check `matchMedia("(prefers-reduced-motion: reduce)").matches` in JavaScript too, and skip `startViewTransition` entirely when it's true.

Check it: turn on reduce motion (on a Mac, System Settings, then Accessibility, then Display; on Windows, Settings, then Accessibility, then Visual effects, then Animation effects off). Reload and move a card. It moves instantly.

### Step 5: Add small transitions and visual clarity

Add a `transition` of about 150 ms to hover and focus styles on cards and buttons, such as a slight `box-shadow` lift. Show priority with a coloured strip and a text label ("High"), never colour alone. On a phone, let the columns scroll sideways with `overflow-x: auto` and `scroll-snap-type`, one column per screen.

Check it: open DevTools' device toolbar at a phone width. You can swipe between columns, and nothing overflows the page sideways.

### Step 6: Add the favicon and title

Draw a simple SVG icon (three rounded rectangles side by side reads as "board") and save it as `public/favicon.svg`. Vite serves the `public` folder at the site root, so `index.html` points to `/favicon.svg` with a `link` element using `rel="icon"` and `type="image/svg+xml"`. Set the `title` element to "DevBoard"; optionally, render can set `document.title` to "DevBoard (4)" for unfinished tasks.

Then deploy and check the live site, not only localhost.

Check it: the icon shows in the tab on your deployed URL. If not, try a private window first: browsers cache favicons stubbornly.

## Common mistakes

- **Empty columns that collapse.** Symptom: once a column is empty, you can't drop anything into it, because it's zero pixels tall. Fix: a `min-height` on the column's list, and the message inside the drop target.
- **Animating every card on every render.** Symptom: a keyframe "fade in" on cards replays for the whole board after every change, because render creates new elements each time. Fix: use view transitions, which animate only what moved, or apply entry animations only to the one task you just added.
- **View transition names that start with a digit.** Symptom: some cards animate and others don't, seemingly at random. Fix: prefix every name with `card-`.
- **One message for every kind of empty.** Symptom: after a search with no results, every column says "No tasks yet. Drop one here", and the user thinks their tasks are gone. Fix: check whether the column has tasks before choosing the message.
- **Ignoring reduced motion.** Symptom: nothing you'd notice, but some users feel unwell. Fix: honour `prefers-reduced-motion` in CSS and before calling `startViewTransition`.

## Say it in the interview

"I treated empty states as real screens: an empty column tells you to drop a card or press plus, and a search with no results says so and offers to clear it. For motion I used the View Transition API, which fits a re-render-everything app because it animates between the old and new page by element name. It's feature-detected and switched off under reduced motion. The tradeoff is browser support: where it's missing, cards move instantly, which I accepted over hand-writing FLIP animations."

## Stretch goals

- Add a dark theme with `prefers-color-scheme` and CSS custom properties for every colour.
