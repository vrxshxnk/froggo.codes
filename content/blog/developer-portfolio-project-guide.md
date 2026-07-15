---
title: "Project 1: The Portfolio Site — Why Your First Build Should Have Zero Dependencies"
excerpt: "The full build guide for Project 1 of our Development Roadmap. No frameworks, no templates — just the web platform, a wireframe, and a deploy. Here's the structure, the order, and the traps."
date: "2026-07-09"
author: "Froggo"
tags: ["projects", "roadmap", "html", "css", "portfolio"]
featured: true
---

Every developer's first instinct is to start their portfolio by running `npx create-next-app`. I want to talk you out of it.

This is the companion guide to [Project 1 of the Development Roadmap](/development) — the free project ladder where we give you milestones and hints, never code. This post explains the *thinking* behind each milestone: why they exist, why they're in this order, and where people actually get stuck. If you haven't opened the roadmap yet, do that first — it has the checklist and a hint for every step, and your progress syncs when you sign in.

## Why plain HTML, CSS, and JavaScript

Not because frameworks are bad. Because a portfolio site is the one project where a framework gives you almost nothing and hides almost everything.

A portfolio has no client-side state worth managing. No routing worth abstracting. What it *does* have is layout, spacing, typography, responsiveness, and performance — the exact skills that framework tutorials skip and that interviewers can smell the absence of. When someone who learned React before CSS gets handed a Figma file at their first job, it shows within the hour.

There's a second reason, and it's more uncomfortable: if you can't build a four-section static page without a framework, the framework was never helping you. It was carrying you. This project is where you find out which one it is.

## The shape of the build

Eight milestones, one week, and the order is deliberate. It looks like this:

```filestructure
portfolio/
├── index.html        ← milestone 2: the semantic skeleton
├── styles/
│   └── main.css      ← milestones 3–5: layout, cards, dark mode
├── scripts/
│   └── main.js       ← milestones 5–6: theme toggle, form
└── assets/
    └── (WebP images, favicon)
```

That's the whole project. If your file tree is bigger than this, you've added complexity the project didn't ask for.

## The milestone that everyone skips is the one that matters most

Milestone 1 is a wireframe. On paper. Before any code.

Here's the failure mode it prevents: you open your editor, write a hero section, tweak its padding for forty minutes, decide you hate it, look at three other portfolios, restart. Repeat for a week, ship nothing. **Deciding layout inside the editor is how side projects die on day one** — the editor is a place to *implement* decisions, not make them.

The constraint in the roadmap is four sections: hero, projects, about, contact. That's not a suggestion, it's a scope fence. Every section you add past four roughly doubles the chance you never deploy.

## Semantic HTML is a habit you build now or never

Milestone 2 asks for the full page structure with *zero CSS*. This feels pointless until you understand what it's testing: can your page communicate its structure without visual styling? Screen readers experience your page this way. So does Google. So does anyone on a broken connection.

The practical rule from the hint is worth internalizing: every time you type `<div>`, pause and ask whether `<nav>`, `<section>`, `<article>`, or `<footer>` says it better. You'll say no plenty of times — divs are fine as styling wrappers — but the pause is the habit. Developers who build this habit in week one write more accessible markup for the rest of their careers without thinking about it.

## Mobile-first is a writing order, not a philosophy

Milestone 3 says design mobile-first, and most people nod along without understanding what it operationally means. It means this: **write your CSS so that the single-column mobile layout requires no media queries at all.** The mobile layout is the default. Then you add exactly one breakpoint (~768px works) where the projects section becomes a grid.

Do it in the other direction — desktop first, then override everything for mobile — and you end up with twice the CSS and half the confidence. Undoing styles is much harder than adding them.

One testing tip that sounds trivial and isn't: resize by dragging the browser edge slowly, not by clicking devtools presets. Presets test three widths. Dragging tests all of them, and the layout bugs live *between* the presets.

## The two details that separate a real page from a tutorial page

**Fixed aspect ratios on project cards.** When your project screenshots have different dimensions, the grid rows jump around as images load and nothing lines up. `aspect-ratio` plus `object-fit: cover` fixes it in two lines. Nobody teaches this; everybody's first grid suffers from it.

**Dark mode without the flash.** The naive version reads `localStorage` inside a script at the bottom of the page or after DOMContentLoaded — which means users who chose dark mode get blasted with a white page for 200ms on every visit. The fix is architectural, not clever: put every color in a CSS custom property on `:root`, switch themes by flipping a single `data-theme` attribute, and read the stored preference in a tiny *blocking* script in the `<head>` — the one legitimate use of render-blocking JavaScript you'll meet this year. Once you've felt this problem, you'll understand why every framework's theming library obsesses over it.

## Lighthouse is a boss fight, and it's rigged in your favor

Milestone 7 asks for 95+ in every category. This sounds intimidating and is actually the most mechanical milestone of the eight, because Lighthouse *tells you what's wrong*. The usual suspects, in order of how often I see them:

1. Images without explicit `width` and `height` attributes — causes layout shift, tanks the performance score
2. Missing `alt` text — accessibility
3. Text contrast that fails WCAG — that stylish gray-on-gray you liked
4. PNG screenshots that should be WebP or AVIF — often a 10x size difference
5. No meta description — SEO

Treat the audit as a checklist, not a judgment. The reason this milestone exists isn't the score — it's that fixing these five things once, by hand, teaches you what frameworks like Next.js are automating when they optimize images and fonts for you. You'll appreciate the machinery more for having been the machinery.

## Deploy before you're proud of it

The last milestone is a real URL, and the hint says something that deserves expansion: connect the GitHub repo to Vercel or Netlify so *every push deploys automatically*. From that moment, "shipping" stops being an event and becomes a side effect of committing. That mental shift — deployment as ambient, not ceremonial — is possibly the single most professional habit this project can give you.

And if you own a custom domain, point it now, while the stakes are zero. DNS propagation, CNAME vs. A records, the hour of "why isn't it working" that resolves itself — this is a lesson everyone pays for exactly once, and it's cheaper to pay for it on a portfolio than during a production launch.

## What this project proves

When it's done, you'll have something almost nobody entering this industry has: a page where you understand every single line, deployed at a URL, scoring 95+ on the audits that companies actually run against their own sites. That's a small thing and a real thing.

Interviewers can tell the difference between "I built this" and "I configured this." Project 1 is the first one.

---

**Ready to build it?** The [Development Roadmap](/development) has all eight milestones with a hint on every step — sign in (free) to unlock the hints and track your progress. Next up: [Project 2, DevBoard](/blog/devboard-kanban-project-guide), where you'll build a drag-and-drop kanban board and learn what state management actually means before a framework does it for you.
