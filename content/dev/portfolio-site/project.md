---
id: portfolio-site
name: Developer Portfolio
tagline: A fast, responsive one-page site, live at your own URL
summary: >-
  Build a four-section personal site in plain HTML, CSS and JavaScript with no framework and no build step, then put it on a real URL that redeploys every time you push.
time: About 1 week, 15-20 hours
---

## What you're building

A single page about you, at a URL you can paste into a resume or a LinkedIn message. A visitor lands on a hero with your name, what you do and two buttons. They scroll through cards for your projects, a short About section and a contact form that actually emails you. On a phone it's one tidy column. On a laptop the projects spread into a grid. A button in the header switches to dark mode, and the site remembers the choice on the next visit, without ever flashing white first.

Under the hood it's three files and a folder of images. No React, no Tailwind, no `npm install`. Every line is something you wrote and can explain, and it scores 95 or more in every Lighthouse category. That's the point. This project teaches the web platform itself: how a browser reads a page, lays it out and fetches it from a server somewhere.

## Features

- A planned layout: four sections (hero, projects, about, contact), sketched for phone and laptop before any code
- Semantic HTML that reads in a sensible order with no CSS at all
- A mobile-first layout with one breakpoint, built with flexbox and grid
- A projects grid of identical cards, each with an image, title, one-liner, a live link and a source link
- A dark mode toggle that remembers the choice and never flashes the wrong theme
- A contact form with friendly validation that sends without a page reload
- 95+ on Lighthouse Performance, Accessibility, Best Practices and SEO
- Live on a public URL, redeploying automatically on every push, optionally on your own domain

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| Markup | Plain HTML in one `index.html` | A portfolio is one page of content. HTML is the content. |
| Styles | Plain CSS in `styles/main.css`, with custom properties | Flexbox, grid, custom properties and media queries are all built in. A framework would hide exactly what you're here to learn. |
| Behaviour | Plain JavaScript in `scripts/main.js` | Only two features need JS: the theme toggle and the form. |
| Fonts | The system font stack | Zero downloads and zero layout shift. A web font from Google Fonts is fine if you want one, at a small Lighthouse cost. |
| Form backend | Formspree | You get email from a form without running a server. Web3Forms works the same way if you prefer it. |
| Local preview | `python3 -m http.server` | Serves the folder at `http://localhost:8000`, so the page behaves as it will online. VS Code's Live Server extension is a fine alternative. |
| Code hosting | Git and GitHub | Your source link on the resume, and the trigger for every deploy. |
| Site hosting | Netlify | Connect the GitHub repo once and every push deploys. Vercel works identically for a static site. |

There's no build step. The files you edit are the files the browser downloads.

## How it fits together

```text
  your laptop                 GitHub                   Netlify
 ┌────────────┐  git push  ┌──────────┐  webhook   ┌──────────────┐
 │ index.html │ ─────────► │  repo    │ ─────────► │ copies files │
 │ styles/    │            └──────────┘            │ to its CDN   │
 │ scripts/   │                                    └──────┬───────┘
 │ assets/    │                                           │ HTTPS
 └────────────┘                                           ▼
                 DNS: yourname.dev ──► Netlify ──► visitor's browser
                                                         │ form submit (fetch)
                                                         ▼
                                                    Formspree ──► your inbox
```

Follow one visit. A recruiter types your domain. Their computer asks DNS (the internet's phone book) which server holds that name, and DNS answers with Netlify. The browser downloads `index.html`. A tiny script in the `head` runs first and sets the saved theme before anything is drawn. Then the browser fetches the CSS and images, lays the page out for the screen width it has, and paints it. The recruiter fills in the form, and your JavaScript checks the fields and posts them to Formspree with `fetch`. Formspree emails you, and the page shows "Thanks, I'll reply soon" without reloading. None of this needed a server you had to write.

## Out of scope

- **A framework, Tailwind or Bootstrap.** They're fine tools, but they hide layout and spacing, which are the skills this project exists to build. You'll use React-style thinking in [DevBoard](/development/devboard).
- **More than four sections, a blog or extra pages.** Every section you add is another thing to finish before you can deploy. Ship four, add more later.
- **Your own backend for the contact form.** Writing an API is a later project. A form service does this job in ten minutes.
- **Animation libraries and scroll effects.** They cost performance and accessibility points and add nothing a recruiter needs.
- **A CMS or loading projects from JSON with JavaScript.** Three or four cards written in HTML load faster, work without JS and are read by search engines with no effort.

## How to work through it

1. **Plan and structure** (scope and wireframe, semantic skeleton): about 4 hours. Real content, real headings, no CSS yet.
2. **Layout and components** (responsive layout, projects grid): about 5 hours. This is where most of the CSS learning happens.
3. **Behaviour** (dark mode, contact form): about 4 hours. The only JavaScript in the project.
4. **Quality and launch** (Lighthouse, deploy): about 4 hours, plus however long DNS takes if you use a custom domain.

The rule that matters most: **make each milestone's decisions before you open the editor, and finish the page with zero CSS before you style it.** Students who design inside the editor rewrite the hero five times and never deploy. If you want to deploy early, connect Netlify after the skeleton is done. A live URL that improves with every push is better motivation than a perfect local file.

## Show it off

Your README should include:

- The live URL at the very top, and a screenshot of the site in both themes
- Your wireframe photo next to the finished page
- Your Lighthouse scores (a screenshot of the four circles), and the two or three fixes that moved them most
- A one-paragraph note on how dark mode avoids the flash, and how the form works without a backend
- The file tree, to show there are no dependencies

To demo it, open the site on your phone in front of the interviewer, switch the theme, refresh to show it remembered, then send yourself a message through the form.

Resume bullets to adapt (measure your own numbers):

- "Built and deployed a dependency-free portfolio in semantic HTML, CSS and JavaScript, scoring X+ in all four Lighthouse categories with continuous deployment from GitHub"
- "Cut total page weight from X KB to Y KB by converting screenshots to WebP and setting explicit image dimensions, bringing Cumulative Layout Shift to Z"
