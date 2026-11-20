---
id: lighthouse-pass
project: portfolio-site
title: Hit 95+ on every Lighthouse category
summary: >-
  Run Google's Lighthouse audit on your site and fix what it reports until Performance, Accessibility, Best Practices and SEO all score 95 or more. Most of the work is images, alt text, contrast and a meta description.
time: 2-4 hours
doneWhen:
  - A Lighthouse run in an Incognito window, on the Mobile setting, shows 95 or more in all four categories
  - Every img has alt text and width and height attributes
  - Project screenshots are WebP or AVIF, and the whole page downloads in well under 1 MB
  - The page has a meta description, a descriptive title and a favicon
  - You ran the audit three times and wrote the before and after scores in your README
docs:
  - label: "Chrome for Developers: Lighthouse overview"
    url: https://developer.chrome.com/docs/lighthouse/overview
  - label: "web.dev: Learn Images"
    url: https://web.dev/learn/images
  - label: "web.dev: Cumulative Layout Shift (CLS)"
    url: https://web.dev/articles/cls
  - label: "web.dev: Largest Contentful Paint (LCP)"
    url: https://web.dev/articles/lcp
  - label: "MDN: Color contrast"
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast
---

## What you're building

A site that scores 95 or above in all four Lighthouse categories, with the before and after scores in your README. To a visitor, the page appears almost instantly even on a weak phone signal, nothing jumps while it loads, every image is described for screen readers, and search results show a proper title and description.

**Lighthouse** is an auditing tool built into Chrome DevTools. It loads your page under controlled conditions, measures it, and gives four scores out of 100, with a list of specific problems and how to fix each one.

## Why it matters

Companies audit their own sites with these tools, because slow or inaccessible pages cost users. Fixing the issues by hand once teaches you what frameworks like Next.js automate with image and font optimisation. And "95+ across the board" is a resume claim anyone can check.

## Before you start

- **The four categories.** *Performance* measures how fast the page appears and becomes stable. *Accessibility* checks for problems that block people using screen readers, keyboards or low vision. *Best Practices* covers things like HTTPS and console errors. *SEO* (search engine optimisation) checks that search engines can read and describe the page.
- **Core Web Vitals.** Google's main speed metrics. **LCP** (Largest Contentful Paint) is when the biggest element, often your hero image or headline, appears. **CLS** (Cumulative Layout Shift) measures how much things jump around as the page loads. Both feed the Performance score.
- **Image formats.** PNG is lossless and large. JPEG is smaller for photos. **WebP** and **AVIF** are newer formats that are usually much smaller again at the same visual quality, and current browsers support them. Screenshots are often the heaviest thing on a portfolio.
- **Lab test.** Lighthouse simulates one load on a throttled phone, so scores vary a few points between runs.

## Build it step by step

### Step 1: Run a clean baseline audit

Extensions run code on every page and drag scores down, so open your site in an Incognito window, where they're off by default. Serve it with `python3 -m http.server 8000` or use your deployed URL; don't audit a file opened straight from disk.

Open DevTools, go to the Lighthouse panel, choose **Mobile**, tick all four categories, and click Analyze. Mobile is the harder test and the one that matters.

Write down the four scores.

Check it: you have a baseline, for example "Perf 71, A11y 88, BP 96, SEO 82", in your notes.

### Step 2: Fix image size and format

Image problems usually top the Performance list. Convert each project screenshot to WebP (or AVIF) at the largest size it's actually displayed, not the size you captured. A card that's never shown wider than 600px doesn't need a 2560px image; you can export a 1200px version for sharp high-density screens. Squoosh, Google's browser-based image tool, needs no install. On the command line, Google's `cwebp` works too:

```bash
cwebp -q 80 assets/devboard.png -o assets/devboard.webp
```

Update the `src`, and keep the `width` and `height` attributes matching the new file.

For images below the first screen, add `loading="lazy"`. Never lazy-load the hero image or anything visible on load: that delays LCP, and Lighthouse will tell you so.

Check it: in the Network panel, filter by Img, reload, and compare the total size before and after.

### Step 3: Kill layout shift

Look for "Image elements do not have explicit width and height" in the report. Every `img` needs both attributes, set to the file's real pixel size. You did this in the projects milestone; now check the hero photo, logos and icons too.

Web fonts can cause shift too, when the fallback font swaps for the real one. If you kept the system font stack, you have no problem here. If you added a web font, use `font-display: swap` and load only the weights you use.

Check it: Lighthouse reports CLS close to 0 (anything under 0.1 is counted as good).

### Step 4: Fix accessibility failures

Work through the Accessibility list. The usual ones:

- "Image elements do not have `[alt]` attributes": add meaningful alt text, or `alt=""` for decoration.
- "Background and foreground colors do not have a sufficient contrast ratio": darken (or, in dark mode, lighten) the muted text or the accent. Use DevTools' colour picker, which shows the ratio live.
- "Links do not have a discernible name": usually an icon-only link, like the GitHub icon in your footer. Give it an `aria-label` or visually hidden text.
- "Form elements do not have associated labels": a field without a `label for` that matches its `id`.

Run the audit in both themes.

Check it: Accessibility scores 95 or more in light and in dark mode.

### Step 5: Fix SEO and Best Practices

For SEO, add a `meta name="description"` in the `head`: one or two short sentences saying who you are and what you do. That's the text Google may show under your link. Check your `title` is descriptive, `html` has `lang="en"`, and no link text is a vague "click here".

Add a favicon: a small square image linked from the `head`, shown on the browser tab. Without one, the browser requests `/favicon.ico` anyway and logs a 404.

For Best Practices, open the Console and fix every error, since errors logged during load count against you. HTTPS also counts, and you'll get it automatically when you deploy.

Check it: the Console is empty on a fresh load, and SEO and Best Practices show 95 or more.

### Step 6: Re-run and record

Run the full audit three times on Mobile and take the middle result. Screenshot the four scores and add them to your README with a line on the fixes that moved the score most, for example "Converting screenshots to WebP cut page weight from 2.1 MB to 310 KB." Use your own measured numbers.

After you deploy, run it once more on the live URL, or use PageSpeed Insights, which runs the same Lighthouse engine from Google's servers.

Check it: three runs in a row all show 95 or more in every category.

## Common mistakes

- **Auditing with extensions on.** Symptom: Performance swings between 70 and 95 with no code changes. Fix: Incognito, extensions off, other tabs closed.
- **Lazy-loading the hero image.** Symptom: LCP gets worse after you "optimised" images. Fix: only use `loading="lazy"` below the first screen.
- **Converting format but not size.** Symptom: WebP files that are still hundreds of KB each. Fix: resize to roughly twice the displayed width before converting.
- **Auditing only on Desktop.** Symptom: 100 on Desktop, high 70s on Mobile, and that's what PageSpeed shows a recruiter. Fix: always test Mobile first.
- **Chasing 100 instead of fixing problems.** Symptom: an evening spent shaving 20 milliseconds for one point. Fix: once every category is at 95+ and the report lists nothing important, stop. The point is the fixes, not the badge.

## Say it in the interview

"I took the site from a Mobile Lighthouse performance score of X to Y. The biggest win was images: I resized screenshots to their display size and converted them to WebP, which cut page weight from A to B. Explicit width and height on every image took layout shift to near zero, and I fixed contrast failures that only showed in dark mode. I stopped at 95 rather than chasing 100, because the remaining points were run-to-run noise rather than real problems."

## Stretch goals

- Serve AVIF with a WebP fallback using the `picture` element, and compare file sizes for each screenshot.
- Add Open Graph meta tags (`og:title`, `og:description`, `og:image`) so your link shows a proper preview card when pasted into LinkedIn or WhatsApp.
