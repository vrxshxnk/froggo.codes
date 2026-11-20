# Development roadmap guides: the style guide

Every project on the Development roadmap (`src/data/roadmaps.js`, `development.modules`) gets a **project brief**, and every milestone gets a **milestone guide**. Together they should be the only thing a student needs to build the project. They shouldn't need YouTube or a second tutorial.

```text
content/dev/<project-id>/project.md         -> /development/<project-id>
content/dev/<project-id>/<milestone-id>.md  -> /development/<project-id>/<milestone-id>
```

`<project-id>` is the module `id` and `<milestone-id>` is the item `id` from `roadmaps.js`. Don't rename them: they key students' saved progress.

Check your work with `node scripts/check-dev-content.mjs [project-id ...]`.

## The promise: we never hand out the code

The roadmap promises "Code given: 0. Every line you ship is yours." The guides keep that promise. They teach everything **around** the code so a student can write it themselves: what to build, the concepts, the order of steps, the decisions, the traps and how to check it works.

**Allowed in code blocks:**

- **Data shapes:** a JSON example of state, a table sketch in SQL, a type.
- **Commands:** `npm create`, `psql`, `curl` to test an endpoint.
- **Small config:** a `.env` key list with fake values, a package script.
- **A single platform API call** that shows a signature or a famous trap. For example, `event.preventDefault()` in `dragover`, or `fetch(url, { signal })`. Keep these to a few lines.
- **Pseudocode** in a `text` fence, to show the shape of an algorithm or flow.

**Not allowed:** code that completes the milestone. That means no finished components, route handlers, reducers or SQL migrations to copy. If a student could paste the block and tick the milestone off, it's too much.

The checker warns about any fence over 12 lines (`text` fences may go to 20). Treat that as a smell, not a quota.

## Milestone guide: frontmatter

```yaml
---
id: data-model                          # the item id, exactly
project: devboard                       # the module id, exactly
title: Design the data model before any UI   # same as the roadmap item title
summary: >-                             # 1-2 sentences, plain English; also the meta description
  Decide the shape of your board's state before you draw anything, so that drag-and-drop, undo and saving all become easy.
time: 2-3 hours                         # honest estimate for a student doing it for the first time
doneWhen:                               # 3-7 checks the student can verify themselves; rendered as a tickable checklist
  - Your state shape is written down as a comment or a types file before any rendering code exists
  - Moving a task between columns only changes two arrays of ids
docs:                                   # 2-5 links, official docs only (MDN, react.dev, nextjs.org, postgresql.org, docs.stripe.com, ...)
  - label: "MDN: crypto.randomUUID()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
---
```

## Milestone guide: sections, in this order

Use exactly these `##` headings.

1. **`## What you're building`**: 1-2 short paragraphs on what exists at the end of this milestone, from the user's point of view where there is one. Be concrete, for example "a card you can drag into another column, and it stays there after a refresh."
2. **`## Why it matters`**: what real-world skill this proves and why companies care. One short paragraph, two at most.
3. **`## Before you start`**: the concepts the student needs, each one explained in 2-4 sentences in plain English. Use a bulleted list with the concept in bold. Link to the official docs inline where useful. Assume they finished the previous milestones, and no more.
4. **`## Build it step by step`**: the core of the guide. Use `### Step 1: <imperative>`, `### Step 2: ...`, usually 4-8 steps. Each step says what to do, why, and how to check it worked before moving on ("refresh the page: the task should still be there"). Name the APIs, functions and files involved. Show data shapes, commands and pseudocode where they help. Never write the implementation (see the promise above). Where there's a real decision (vanilla JS or React, SQL or an ORM), recommend one and say why in a sentence.
5. **`## Common mistakes`**: 3-5 bullets. Each one has the mistake in **bold**, its symptom (what the student will see), and the fix. These come from real experience, so be specific ("the drop event never fires" rather than "drag-and-drop bugs").
6. **`## Say it in the interview`**: a short paragraph, or 2-3 bullets, on how to talk about this milestone in an interview or a project walkthrough. Write it in the first person, as the student would say it, and include a tradeoff they made.
7. **`## Stretch goals`** (optional): 1-3 bullets for students who finish early.

Don't add a "Done when" or "Go deeper" section to the body. The page renders them from `doneWhen` and `docs`.

## Project brief: frontmatter

```yaml
---
id: devboard
name: DevBoard                          # the project name, short
tagline: A kanban board with drag-and-drop, undo and saving   # under 70 characters
summary: >-                             # 1-2 sentences; also the meta description
  Build a Trello-style board in plain JavaScript or React and learn the one idea behind every modern UI framework: the screen is a function of your state.
time: About 1 week, 15-20 hours
---
```

## Project brief: sections, in this order

1. **`## What you're building`**: the finished product in 1-2 paragraphs, as a user would describe it.
2. **`## Features`**: the finished feature list as bullets, one per line. Each feature should map to the milestones.
3. **`## The stack`**: a table with columns `Piece | Use | Why`. Give a recommended default, and name an acceptable alternative where students commonly have one.
4. **`## How it fits together`**: a `text` fence with a simple box-and-arrow diagram, then a paragraph walking through one request or user action end to end.
5. **`## Out of scope`**: bullets naming what NOT to build, so students don't over-build. Say why for each.
6. **`## How to work through it`**: the milestones grouped into 2-4 phases, with rough time per phase, and the one rule that matters most for this project.
7. **`## Show it off`**: what the README must contain, what to demo, and 2 example resume bullets with real numbers the student will measure (written as templates, for example "Cut p95 latency from X ms to Y ms by ...").

## Voice

- Write for a second-year Indian engineering student who knows one language and has built little. Assume they're smart and short on time.
- Use plain English with short sentences, in the second person ("you"). Explain every term the first time you use it.
- Be concrete. Use real numbers, real API names and real error messages.
- Don't use filler ("In this guide we will...", "Let's dive in"), hype ("game-changer") or emoji in the body.
- Make no claims you can't back up. Don't invent statistics, company practices or salary numbers.
- Don't mention day or week numbers. The roadmap shows the schedule.
- Write everything in your own words. Never copy from tutorials, docs or the blog posts.
- Link only to official documentation and well-known primary sources (MDN, web.dev, react.dev, nextjs.org, nodejs.org, postgresql.org, redis.io, docs.stripe.com, socket.io, the provider's own docs). Don't link to tutorials, Medium or YouTube.
- Link to other milestones with relative links: `/development/<project-id>/<milestone-id>`.

## Stack and consistency

- Each project already has a blog essay in `content/blog/` (linked from the roadmap). Read it first. The guides must agree with its architecture and its rules, without repeating its prose.
- The roadmap item's `hint` is the student's one-line nudge. The guide expands it, so it must never contradict it.
- Keep code-fence languages to `text`, `json`, `bash`, `sql`, `html`, `css`, `javascript`, `jsx`, `typescript`, `tsx`, `python` or `yaml`, or they won't highlight.

## Length

- Milestone guide: 500-1300 words of prose (code fences don't count).
- Project brief: 500-1200 words.

## Checklist before you finish

- [ ] `node scripts/check-dev-content.mjs <project-id>` shows no ❌ errors.
- [ ] Every `doneWhen` item is something the student can check in under a minute.
- [ ] No code block completes the milestone for them.
- [ ] Every doc link is a real page on an official site. If you can't check a URL, link the docs home page instead of guessing a deep path.
- [ ] Read it as a student: could you build this milestone from this page alone?
