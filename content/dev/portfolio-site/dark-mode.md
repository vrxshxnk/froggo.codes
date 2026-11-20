---
id: dark-mode
project: portfolio-site
title: Add a dark mode toggle that remembers the choice
summary: >-
  Put every colour in a CSS custom property, switch themes by flipping one data-theme attribute, and save the choice in localStorage. A tiny script in the head applies it before the first paint, so there's never a flash of the wrong theme.
time: 2-3 hours
doneWhen:
  - Clicking the toggle switches the whole page, including form fields and the scrollbar, between light and dark
  - Refresh in dark mode, with network throttling on, and the page never shows white first
  - A first-time visitor whose operating system is set to dark mode gets the dark theme without clicking anything
  - Every colour value in your CSS sits inside the two theme blocks, and every other rule uses var()
  - The toggle works with the keyboard and its label says what it will do
  - Text passes contrast checks in both themes
docs:
  - label: "MDN: Using CSS custom properties"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
  - label: "MDN: prefers-color-scheme"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
  - label: "MDN: Window.localStorage"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  - label: "MDN: color-scheme"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
  - label: "MDN: Window.matchMedia()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
---

## What you're building

A button in the header, a sun or moon icon with a proper label, that switches the whole site between a light and a dark theme. Close the tab, come back tomorrow, and the site opens in the theme you picked. If you've never picked one, it follows your phone or laptop's system setting. And the detail most sites get wrong: if you chose dark, the page is dark from the very first frame. It never shows a white page for a moment before switching.

## Why it matters

Theming is a small feature with a real architecture lesson inside it. Done well, it's one attribute change, because every colour already comes from a variable. Done badly, it's hundreds of overrides and a flash of white on every visit. The flash teaches you the order in which a browser reads HTML, runs scripts and paints the screen, which is what lets you reason about performance later.

## Before you start

- **CSS custom properties (variables).** Named values you define once and reuse, like `--color-bg: #ffffff`, read with `var(--color-bg)`. Unlike values in most languages, they cascade: redefine one on an element and everything inside it picks up the new value. That's what makes a theme switch a single change.
- **Data attributes.** Any attribute starting with `data-` is yours to invent. Setting `data-theme="dark"` on the `html` element gives CSS a hook (`[data-theme="dark"]`) and JavaScript an easy handle (`document.documentElement.dataset.theme`).
- **`localStorage`.** A small key-value store in the browser for your site. It holds strings and survives closing the tab. Reading and writing it is synchronous, which is exactly why it works before the first paint. It can also throw an error, for example in some private browsing modes, so wrap access in `try`/`catch`.
- **`prefers-color-scheme`.** A media query that reports whether the user's operating system is set to light or dark. JavaScript can read it with `matchMedia`.
- **Render-blocking scripts.** When the browser meets a normal `script` tag in the `head`, it stops reading the page, runs the script, then carries on. Usually that's bad for speed. Here it's what you want: a few lines that run before anything is drawn.

## Build it step by step

### Step 1: Move every colour into variables

If you followed the layout milestone, your colours are already custom properties on `:root`. Now make sure nothing else in the CSS uses a raw colour. Search the file for `#`, `rgb(` and named colours like `white`, and replace each with a variable. You'll probably need five to eight: background, surface (for cards), text, muted text, accent, border, and the focus outline.

Name them by purpose: `--color-text` works in both themes, `--color-black` doesn't.

Check it: change `--color-bg` to bright red for a moment. Every background that should change, does.

### Step 2: Define the dark theme

Write a second block with the selector `[data-theme="dark"]` that redefines the same variables with dark values. Don't simply invert: pure black with pure white text is harsh. A very dark grey background with off-white text is easier on the eyes. Your accent colour may need to be lighter in dark mode to keep enough contrast.

Also set `color-scheme: dark` in the dark block, and `color-scheme: light` on `:root`. That tells the browser to draw its own parts (form fields, scrollbars, checkboxes) in matching colours.

Check it: in DevTools, add `data-theme="dark"` to the `html` element by hand. The whole page should turn dark, form fields included.

### Step 3: Decide the theme before the first paint

Put a small inline `script` in the `head`, before your stylesheet link, not in `main.js` and not deferred. It decides the theme and sets the attribute, and the browser runs it before drawing anything:

```text
saved = read "theme" from localStorage (inside try/catch; null on error)
if saved is "light" or "dark":
    theme = saved
else:
    theme = "dark" if the system prefers dark, otherwise "light"
set data-theme on the html element to theme
```

Store only the user's explicit choice. If they never clicked, store nothing, so their system setting keeps working if they change it later.

Check it: set the theme to dark by hand in the console with `localStorage.setItem("theme", "dark")`, then refresh. The page is dark immediately.

### Step 4: Build the toggle button

Add a `button` to the header with `type="button"`. Its accessible name should say what it will do: "Switch to dark theme" when the page is light. An icon is fine, but pair it with an `aria-label` or visually hidden text. Screen readers don't read icons.

In `scripts/main.js`, loaded with `defer` at the end of the `head`, listen for clicks on the button. On click: work out the opposite of the current `data-theme`, set it on the `html` element, save it to `localStorage` under the same key, and update the button's label. That's the whole handler.

Check it: click the toggle, then refresh. The theme you picked stays. Tab to the button and press Enter or Space: it toggles.

### Step 5: Test for the flash properly

The flash only shows on a slow load, so make the load slow. In DevTools' Network panel, tick "Disable cache" and choose a slow throttling preset. Set dark mode, then refresh several times.

If you see white first, something runs too late. Usual causes: the theme script is in `main.js` with `defer`, it's at the bottom of the body, or it runs on `DOMContentLoaded`. Move the logic inline into the `head`.

Check it: with throttling on, every refresh in dark mode is dark from the first frame.

### Step 6: Check contrast in both themes

Contrast is the difference in brightness between text and background. In DevTools, select a text element and look at the colour picker in the Styles pane, which shows the contrast ratio. Normal-size body text needs at least 4.5:1 to meet WCAG AA, the accessibility standard Lighthouse checks against.

Check muted text, links and buttons in both themes; a subtle grey in light mode is often unreadable in dark.

Check it: Lighthouse's accessibility audit, run once in each theme, shows no contrast failures.

## Common mistakes

- **The theme script runs too late.** Symptom: dark-mode users see a white flash on every page load. Fix: an inline script in the `head`, before the stylesheet, with no `defer` and no event listener around it.
- **No `try`/`catch` around `localStorage`.** Symptom: in some private windows the page throws an error and the rest of your script stops running. Fix: wrap reads and writes, and fall back to the system preference.
- **Forgetting `color-scheme`.** Symptom: in dark mode the inputs are glaring white boxes and the scrollbar is light. Fix: set `color-scheme: dark` in the dark theme block.
- **Saving a value on first load.** Symptom: a user who changes their system to dark next month still gets light, because you stored "light" before they ever clicked. Fix: only write to `localStorage` in the click handler.
- **Colour transitions everywhere.** Symptom: on page load in dark mode, things visibly fade from light to dark. Fix: don't put a global transition on colours, or only add it after the first paint.

## Say it in the interview

"Every colour is a custom property, and the dark theme just redefines them under a `data-theme` attribute on the `html` element. The saved choice lives in `localStorage`, and a tiny inline script in the `head` sets the attribute before the first paint, which is why there's no white flash. It's render-blocking on purpose: three lines of synchronous JavaScript cost almost nothing, and moving it later is exactly what causes the flash. If the user never chose, I follow `prefers-color-scheme` and store nothing."

## Stretch goals

- Listen for changes to the system theme with `matchMedia(...).addEventListener("change", ...)`, and follow them live when the user hasn't made a choice.
- Make the theme work with JavaScript off: put the dark values inside a `prefers-color-scheme: dark` media query as well, and hide the toggle unless scripts run.
