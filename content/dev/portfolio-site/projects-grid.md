---
id: projects-grid
project: portfolio-site
title: Build the projects grid with reusable cards
summary: >-
  Design one project card and repeat it: an image, a title, a one-line description and two links. Fixed image ratios and a little flexbox keep every card the same shape, so the grid never jumps.
time: 2-3 hours
doneWhen:
  - Every card has an image, a title, a one-line description, a live link and a source link
  - All card images show at the same aspect ratio, even though your screenshots are different sizes
  - Cards in the same row are the same height, with their links lined up along the bottom
  - On a slow connection (DevTools throttling), the grid doesn't jump as images load
  - Every card uses the same class names, and adding a new project means copying one block of HTML
  - A screen reader or the accessibility tree announces each link with its project's name, not just "Live"
docs:
  - label: "MDN: aspect-ratio"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio
  - label: "MDN: object-fit"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
  - label: "MDN: The article element"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article
  - label: "web.dev: Cumulative Layout Shift (CLS)"
    url: https://web.dev/articles/cls
---

## What you're building

The Projects section, finished. Two to four cards sit in the grid from the last milestone. Every card has a screenshot on top, cropped to the same shape, then the project name, one line about what it does, and two links at the bottom: the live site and the source code. Cards in a row are the same height with their links aligned, even when one description runs to two lines. Load the page on a slow connection and nothing shifts while images arrive.

The card is a **component**: one design, defined once in CSS, repeated with different content. No framework needed.

## Why it matters

Cards are everywhere: product listings, dashboards, search results. A grid that stays aligned with messy real content shows you understand how layout and images interact. The unstable version, where everything jumps down as images load, is called layout shift. Google measures it as part of its Core Web Vitals, and it's the main thing Lighthouse will check about your grid.

## Before you start

- **Components without a framework.** In plain HTML a component is a repeated block of markup with the same class names, styled once in CSS. If every card uses `.card`, `.card-title` and `.card-links`, one CSS change updates them all.
- **`aspect-ratio`.** A CSS property that fixes an element's width-to-height ratio. `aspect-ratio: 16 / 9` on an image means it's always 16 wide for every 9 tall, whatever the file's real size.
- **`object-fit`.** Controls how an image fills its box when the shapes don't match. `cover` fills the box completely and crops the overflow, like a phone wallpaper. `contain` shows the whole image with empty bands at the sides.
- **Layout shift.** When an image loads, the browser finally learns its size and pushes everything below it down. The page jumps under your thumb. If the browser knows the image's size in advance, from `width` and `height` attributes, it reserves the space and nothing moves.
- **Accessible link names.** A screen reader can list every link on a page out of context. Four links that all say "Live" are useless in that list. Each link needs a name that says which project it belongs to.

## Build it step by step

### Step 1: Prepare the images

Take a screenshot of each project at the same browser size, for example a 1280 by 720 window. Crop each to a 16:9 ratio, and save them in `assets/` with clear names like `devboard.png`. Converting to WebP comes in [the Lighthouse milestone](/development/portfolio-site/lighthouse-pass). For now, just keep them under about 1600px wide.

If a project has no screenshot (a command-line tool, say), make a simple image with its name on a coloured background. Every card has the same parts.

Check it: every project has one image in `assets/`, all roughly the same shape.

### Step 2: Write down what a card contains

Before any markup, decide the fields every card has. This is the card's data shape, the same for every project:

```json
{
  "title": "DevBoard",
  "description": "A kanban board with drag-and-drop, undo and saving.",
  "image": "assets/devboard.png",
  "imageAlt": "DevBoard showing three columns of task cards",
  "liveUrl": "https://devboard-asha.netlify.app",
  "sourceUrl": "https://github.com/asha/devboard"
}
```

Then write the HTML for the first card: an `article` containing the `img` (with `alt`, `width` and `height`), an `h3` title, a `p` description, and a small group holding the two `a` links. Copy that block for each project, changing only the content. Keep this as hand-written HTML rather than building cards from a JavaScript array: it loads faster, works with JavaScript off, and is read by search engines with no extra effort.

Check it: every card has all six fields filled in.

### Step 3: Fix the image shape

In CSS, give the card image `width: 100%`, an `aspect-ratio` matching your screenshots (16 / 9) and `object-fit: cover`. Now a screenshot that's a slightly different shape gets cropped to fit instead of making its card taller.

Keep the `width` and `height` attributes in the HTML too, set to the image file's real size. CSS controls the displayed size. The attributes tell the browser the ratio before the file arrives, so it can reserve the space.

Check it: temporarily swap one screenshot for a tall, narrow image. The card should keep exactly the same shape, with the image cropped.

### Step 4: Make cards equal height with links at the bottom

Grid items in the same row stretch to the same height by default, but the content inside them doesn't. Make the card itself a flex container in a column direction. Then give the links group `margin-top: auto`, which pushes it to the bottom of the card whatever the description length.

Add padding below the image, a border or subtle shadow from your colour variables, and rounded corners (with `overflow: hidden` so the image's corners round too).

Check it: make one description three lines long. That card's links should still line up with the others in its row.

### Step 5: Name the links properly

Visually, the links can say "Live" and "Source", but screen readers need the project name. One approach is visually hidden text: put the project name inside the link in a `span` with a class that hides it visually but not from assistive technology. The other is an `aria-label` on the link, such as "DevBoard live site". Pick one and use it on every card.

If a link opens a new tab with `target="_blank"`, say so in the accessible name ("opens in a new tab"), or don't open a new tab at all. Most users can open a new tab themselves.

Check it: in Chrome DevTools, select a link and open the Accessibility pane. Its computed name should include the project name.

### Step 6: Add focus and hover states

Give the links a hover style and, more importantly, a clear `:focus-visible` style, such as a thick accent-coloured outline. Never remove focus outlines without replacing them.

Check it: Tab through the projects section. You can always see which link is focused.

## Common mistakes

- **No `width` and `height` on images.** Symptom: on first load the section jumps down as each image arrives, and Lighthouse flags layout shift. Fix: put the real pixel size on every `img`, and let CSS do the display sizing.
- **`object-fit` with no fixed box.** Symptom: `object-fit: cover` seems to do nothing. Fix: the image needs a defined shape for `cover` to crop into. That's what `aspect-ratio` provides.
- **Spacing the bottom of cards with margins.** Symptom: links sit at different heights depending on description length. Fix: make the card a flex column and use `margin-top: auto` on the links.
- **Every link says "Live".** Symptom: a screen reader's links list reads "Live, Source, Live, Source" with no context. Fix: add the project name to each link's accessible name.
- **Cards drifting apart.** Symptom: you tweak one card's markup, and now the third card has an extra wrapper and looks different. Fix: when you change the card, change every copy the same way, and keep the class names identical.

## Say it in the interview

"The project card is a component: one set of class names, styled once, repeated in plain HTML. Images have a fixed `aspect-ratio` with `object-fit: cover`, plus real `width` and `height` attributes, so the browser reserves space and the grid never shifts as images load. I chose static HTML over rendering cards from a JavaScript array, because with three or four projects the duplication is small, and the page works with JavaScript off and is fully readable by search engines."

## Stretch goals

- Add a short row of tags under each description (the stack used), styled as small pills with flexbox and `flex-wrap`.
- Add `loading="lazy"` to card images that sit below the first screen, and check in the Network panel that they only load as you scroll.
