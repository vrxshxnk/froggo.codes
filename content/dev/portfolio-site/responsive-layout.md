---
id: responsive-layout
project: portfolio-site
title: Make the layout responsive with flexbox and grid
summary: >-
  Style the page mobile-first, so the one-column phone layout needs no media queries, then add a single breakpoint where the projects section becomes a grid. Flexbox lines things up in a row; grid lays out the cards.
time: 3-4 hours
doneWhen:
  - Dragging the browser window from about 320px to full width never shows a horizontal scrollbar
  - Below the breakpoint everything is one column; above it the projects sit side by side
  - Your stylesheet has exactly one width media query, and it uses min-width
  - On a wide monitor the content stays in a centred column instead of stretching edge to edge
  - The page looks right on a real phone, not just in DevTools
docs:
  - label: "MDN: Flexbox"
    url: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox
  - label: "MDN: CSS grid layout"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
  - label: "MDN: Using media queries"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
  - label: "web.dev: Learn Responsive Design"
    url: https://web.dev/learn/design
---

## What you're building

The plain skeleton from the last milestone starts to look like your wireframe. On a phone, everything stacks in one readable column. Widen the window past the breakpoint and the projects turn into a grid of two or three cards, while text stays in a column narrow enough to read easily. On a huge monitor, the page sits in the middle with space either side.

Card details come in [the next milestone](/development/portfolio-site/projects-grid).

## Why it matters

Most people will open your portfolio on a phone. A layout that breaks between screen sizes is the first thing a recruiter sees, and it's the first thing a front-end interviewer checks, often by dragging the window narrow. Building a layout that works at every width, with little CSS and no framework, is the core front-end skill.

## Before you start

- **The box model.** Every element is a rectangle: content, then `padding` inside the border, then `border`, then `margin` outside it. Setting `box-sizing: border-box` on everything makes `width` include padding and border, which is what you'd expect and avoids most "why is this 20px too wide" bugs.
- **Mobile-first.** A writing order. You write the styles for the smallest screen first, with no media queries, because a single column is the simplest layout. Then you *add* rules for wider screens inside `min-width` media queries. Going the other way means writing desktop styles and then undoing them for phones, which doubles the CSS.
- **Media queries.** A block of CSS that only applies when a condition is true, such as "the viewport is at least 768px wide". The viewport is the visible area of the browser window.
- **Flexbox.** A layout mode for lining items up in one direction, a row or a column. Ideal for the header (name on the left, nav on the right) and the nav links. You set `display: flex` on the parent, and properties like `justify-content`, `align-items` and `gap` control the children.
- **Grid.** A layout mode for two dimensions, rows and columns at once. Ideal for the projects. You set `display: grid` and describe the columns with `grid-template-columns`.
- **`rem` units.** 1rem is the root font size, usually 16px. Spacing in `rem` scales if a user sets a bigger font.

## Build it step by step

### Step 1: Link the stylesheet and set sane defaults

Add a `link rel="stylesheet"` to `styles/main.css` in the `head`. At the top of the file, write a few base rules: `box-sizing: border-box` on every element, zero margin on `body`, images set to `max-width: 100%` and `height: auto` so they never overflow their container, and a system font stack with a `line-height` around 1.5. Define your colours as custom properties on `:root` now (background, text, accent, a muted colour) and use only those variables in the rest of the file. That will make [dark mode](/development/portfolio-site/dark-mode) a small change.

Check it: refresh. The font changes and no image is wider than the screen.

### Step 2: Build the centred content column

Make one reusable class, something like `.container`, that you put inside each section. It needs a `max-width` (around 70rem for the grid, and you can cap paragraphs at about 65ch, roughly 65 characters), `margin-inline: auto` to centre it, and side padding of about 1rem so text never touches the screen edge on a phone.

Give each section the same vertical padding. Consistent spacing makes a page look more professional than any colour choice.

Check it: on a wide window, everything sits in the middle. On a narrow one, text has a gap from the edge.

### Step 3: Lay out the header with flexbox

The `header` holds your name and the `nav`. Make the nav's `ul` a flex row with a `gap` and no bullets. On a phone, the name and the links can stack, or sit on one line if they fit. Your wireframe already decided this. If you used the header as a flex container, `flex-wrap: wrap` lets the nav drop under your name when space runs out, with no media query.

Position the skip link off-screen until it's focused, then show it at the top-left. Not `display: none`, which hides it from keyboard users too.

Check it: press Tab once. The skip link appears. Press Enter: the page jumps to `main`, and the next Tab lands on the first link inside it.

### Step 4: Style the single-column mobile layout

Still with no media queries, style the hero (big headline, pitch, two link-buttons in a flex row with a gap), the project cards stacked vertically, About and the form. Make tappable things about 44px tall or more, and form inputs `width: 100%`.

Test the narrowest realistic width, 320px, using DevTools' device toolbar if your window won't go that narrow.

Check it: at 320px there's no sideways scrolling, and nothing is cut off.

### Step 5: Add the one breakpoint

Now add a single media query. Inside it, turn the projects list into a grid with two columns (or three, if you have three projects), and make any other changes your laptop sketch shows, such as putting the hero text beside a photo.

```css
@media (min-width: 768px) {
  /* only the rules that change at laptop width */
}
```

Space cards with `gap`, not margins, which double up and misalign edges.

Check it: drag the window edge slowly across 768px. The layout should switch once, cleanly, with nothing jumping or overlapping on either side.

### Step 6: Hunt for problems between sizes

DevTools presets test a handful of exact widths, and bugs live between them. Drag the window edge slowly from narrow to wide, watching for text touching an edge, buttons wrapping, or a card suddenly getting very tall.

If a horizontal scrollbar appears, something is wider than the viewport. In DevTools, hover elements in the Elements panel until you find the one sticking out. The usual causes are a fixed `width` in pixels, a long URL or email address that can't wrap (fix with `overflow-wrap: anywhere`), or an image missing `max-width: 100%`.

Finally, open the page on your actual phone. Find your laptop's local IP address, make sure the phone is on the same Wi-Fi, and visit `http://<your-ip>:8000`. If that fails, test again after you deploy.

Check it: no width between 320px and your full screen width causes a scrollbar or overlap.

## Common mistakes

- **Writing desktop first.** Symptom: a stack of `max-width` media queries undoing grids, floats and widths for phones, and fixing one breaks another. Fix: delete them, write the phone layout as the default, and add one `min-width` query.
- **Forgetting the viewport meta tag.** Symptom: on a real phone the whole desktop layout appears shrunk to tiny text, even though DevTools looked fine. Fix: check the `meta name="viewport"` line is in the `head`.
- **Fixed pixel widths.** Symptom: a horizontal scrollbar on phones. Fix: use `max-width` and percentages, and let flex and grid size things.
- **Testing only DevTools presets.** Symptom: someone opens it on their tablet in landscape and the nav wraps badly. Fix: drag the window through every width, and test a real device.

## Say it in the interview

"I wrote the CSS mobile-first: the single-column layout is the default with no media queries, and one `min-width` breakpoint at 768px turns the projects into a grid. I used flexbox for one-dimensional things like the header and nav, and grid for the two-dimensional project layout. I picked one breakpoint over several because the content only changes shape once, and every extra breakpoint is more to test."

## Stretch goals

- Replace your fixed heading sizes with `clamp()`, so the headline grows smoothly with the viewport instead of jumping at the breakpoint.
- Try `grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr))` for the projects and see whether you still need the media query for that section at all.
- Add `scroll-behavior: smooth` inside a `prefers-reduced-motion: no-preference` media query.
