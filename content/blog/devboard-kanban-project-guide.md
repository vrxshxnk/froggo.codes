---
title: "Project 2: DevBoard — The Kanban Board That Teaches You What React Actually Does"
excerpt: "The full build guide for Project 2 of our Development Roadmap. Drag-and-drop, undo, persistence, keyboard access — and the one architectural rule that makes all of it easy instead of impossible."
date: "2026-07-10"
author: "Froggo"
tags: ["projects", "roadmap", "javascript", "state-management"]
featured: false
---

There's a moment in every self-taught developer's life when they finally understand why React exists. For most people it arrives too late — *after* years of using React — as a vague retroactive appreciation. This project is designed to make it arrive on time.

This is the companion guide to [Project 2 of the Development Roadmap](/development). The roadmap has the nine milestones and a hint for each; this post is the architecture briefing — the reasoning that turns those milestones from a to-do list into a design. You can build DevBoard in vanilla JavaScript or React; the milestones are identical either way, and honestly, vanilla teaches you more here.

## The one rule that decides whether this project is easy or miserable

Everything in DevBoard — drag-and-drop, filters, undo, persistence — is either straightforward or nightmarish depending on a single architectural decision you make in the first hour:

> **State is the only source of truth. The DOM is a projection of it. Nothing else.**

Concretely: you have one state object, one `render(state)` function that redraws the board from it, and every event handler does exactly two things — mutate state, call render. That's the entire architecture.

The moment you break this rule — the moment a click handler reaches out and edits the DOM directly, "just this once, it's faster" — you've created two versions of reality: what the state says and what the screen shows. Every bug in every jQuery-era codebase lives in the gap between those two. You will spend the rest of the project reconciling them by hand.

And here's the punchline: `render(state)` **is React**. That's the whole idea — UI as a function of state, re-run on every change. React adds a diffing layer so it doesn't redraw everything, but the mental model you're building by hand this week is the one React is built on. Build it manually once and you'll never again wonder why React "wants" you to put things in state.

## Design the data model before any UI — and get the shape right

Milestone 1 has no visible output, which is why people skip it, which is why their drag-and-drop takes three days instead of one afternoon.

The trap is nesting. The intuitive shape — columns containing arrays of task objects — feels natural and is wrong. Here's why: when you drag a task from "In Progress" to "Done", the nested shape forces you to find the task object, deep-copy it, delete it from one array, insert it into another, and hope nothing else held a reference to it. Multiply that by edit, delete, filter, and undo.

The right shape is flat: tasks live in one map keyed by ID, and columns hold only *arrays of IDs*. Roughly:

```json
{
  "tasks": { "a1": { "title": "Fix login bug" }, "b2": { "title": "Ship v2" } },
  "columns": [
    { "id": "todo", "title": "To Do", "taskIds": ["b2"] },
    { "id": "doing", "title": "In Progress", "taskIds": ["a1"] }
  ]
}
```

Now moving a task between columns is two splices on ID arrays. Editing a task touches one place. Filtering never has to walk a tree. This tasks-by-ID pattern is called *normalization*, it's how Redux docs tell you to shape stores and how databases have shaped tables since the 1970s, and learning it on a kanban board is a lot cheaper than learning it on a production app.

One more rule from the hints that saves real pain: generate IDs with `crypto.randomUUID()`, never array indexes. Index-based IDs shift when anything is deleted, and every reference to them silently rots.

## Drag-and-drop: the platform gives you more than you think

People reach for a drag-and-drop library reflexively. For this project, don't — the native HTML drag events (`dragstart`, `dragover`, `drop`) are genuinely enough, and using them teaches you two things libraries hide.

First, the API's one famous trap: **`drop` never fires unless you call `preventDefault()` in `dragover`.** This is the most-Googled drag-and-drop question in existence because it's completely unguessable — the default behavior of `dragover` is "this is not a drop target." Now you know, and you'll never wonder why your drop handler is silent.

Second, the data flow: put the task ID (just the ID — remember, state is the source of truth, so the ID is all you need) in `dataTransfer` on dragstart, read it on drop, splice the ID arrays, render. Because of your architecture, the actual move is three lines.

Then add a visual drop indicator — a highlighted column border, an insertion line, anything. This isn't decoration. Drag-and-drop without feedback feels broken even when it works, and users won't trust it enough to use it.

## Undo is a reward for good architecture

Milestone 7 — undo for the last ten actions — sounds like the hardest feature on the board. If your state discipline held, it's the easiest, and this is the milestone where the architecture *pays you back*.

Because every change flows through state, "undo" is just: keep a stack of previous state snapshots. Before each mutation, push `structuredClone(state)` onto the stack. On Ctrl+Z, pop it and render. Cap the stack at ten so memory stays flat. Done.

Notice what you did *not* have to do: write an inverse operation for every action ("un-move", "un-delete", "un-edit"). That's the command-pattern approach, and it's what you're forced into when state is scattered across the DOM. Snapshot-based undo is only possible when state is centralized — which is why so many apps you use daily still don't have undo.

Persistence (milestone 6) falls out the same way: serialize the whole state object to localStorage on every change, hydrate on load, wrap the load in try/catch with seed-data fallback so a corrupted entry doesn't brick the app. And version your storage key — `devboard-v1` — so when you change the state shape later, old users get a clean reset instead of a crash. That habit scales all the way up to database migrations.

## The milestone that will actually make you better than other juniors

Keyboard accessibility. Milestone 8. The one everyone is tempted to skip.

Here's the test from the hint, and I mean it literally: unplug your mouse for ten minutes and use your board. Can you reach a card? Edit it? Move it between columns? For most first attempts the answer is no on all three, and the fix — focusable cards, Enter to edit, an explicit "move task" menu for arrow-key moves — takes an evening.

Why bother? Beyond the obvious (some of your users don't use a mouse — permanently or just today, with a sandwich in one hand), there's a career reason: accessibility questions are increasingly common in front-end interviews, and "I made my kanban board fully keyboard-operable, here's how" is an answer approximately zero other candidates have. Real products are legally required to get this right. Demos never bother. You're building a product.

The same logic applies to milestone 9 — empty states and transitions. An empty column that says "Drop tasks here or press +" instead of showing a void, 150ms of easing on card moves. These cost an hour and they're what people screenshot. Nobody screenshots correctness.

## What this project proves

A working DevBoard demonstrates the exact thing that's hardest to verify in an interview: that you can model state, keep a UI honestly in sync with it, and care about the interaction details — drag feedback, undo, keyboard paths — that separate products from demos. And when you pick up React afterward, `useState` won't be an incantation. It'll be the thing you already built, with better ergonomics.

---

**Ready to build it?** All nine milestones with hints are on the [Development Roadmap](/development) — free, with progress tracking when you sign in. Previously: [Project 1, the Portfolio Site](/blog/developer-portfolio-project-guide). Next: [Project 3, Inkwell](/blog/inkwell-blog-platform-guide), where you build your first real backend and meet the security mistakes almost everyone ships.
