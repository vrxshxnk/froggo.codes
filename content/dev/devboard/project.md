---
id: devboard
name: DevBoard
tagline: A kanban board with drag-and-drop, undo and saving
summary: >-
  Build a Trello-style task board in plain JavaScript or React, and learn the idea behind every modern UI framework: the screen is a function of your state.
time: About 1 week, 15-20 hours
---

## What you're building

DevBoard is a kanban board: three columns (To Do, In Progress, Done) full of task cards. You can add, edit and delete cards, drag them between columns, filter and search them, and press Ctrl+Z to undo your last ten actions. Close the tab, come back tomorrow, and everything is exactly where you left it. It also works with no mouse at all.

There's no backend. Everything lives in the browser. That's deliberate: with no server to worry about, all your attention goes to state management, which is the skill this project exists to teach.

## Features

- Three columns of task cards, rendered from one state object
- Add, edit and delete tasks, with a title, an optional description and a priority
- Drag a card to another column, or to another position in the same column
- Filter by priority and search by text, instantly, as you type
- Everything saves to `localStorage` and survives a refresh
- Undo the last 10 actions with Ctrl+Z (Cmd+Z on a Mac)
- Full keyboard control: reach, edit and move every card without a mouse
- Friendly empty states, smooth transitions and a favicon

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| Language | Plain JavaScript (ES2020+) | You'll build by hand what React does for you, so React makes sense afterwards. React is fine too: the milestones are the same. |
| Markup and styles | HTML and CSS (or Tailwind) | Nothing here needs a CSS framework. Plain CSS with custom properties is enough. |
| Drag and drop | The native HTML Drag and Drop API | It's built into every browser. A library would hide the two lessons this teaches. |
| Storage | `localStorage` | Synchronous, simple, and plenty for one user's board. |
| Tooling | Vite (`npm create vite@latest`) | A dev server with instant reload, and no config to write. |
| Hosting | Vercel, Netlify or GitHub Pages | It's a static site: push to GitHub and it deploys. |

## How it fits together

```text
  user action (click, drag, key, type)
              │
              ▼
     event handler ──► update(state) ──► save to localStorage
                            │                 (and push a snapshot
                            ▼                  onto the undo stack)
                     render(state)
                            │
                            ▼
                    the DOM you see
```

Follow one action: you drag "Fix login bug" from To Do to Done. The `drop` handler reads the task's id, then asks one function to update the state: remove that id from the To Do column's list of ids and insert it into Done's. That function first pushes a copy of the old state onto the undo stack, and afterwards saves the new state to `localStorage`. Then `render(state)` redraws the board. The handler never touches the DOM itself. Every feature on the list above is another way into the same loop.

## Out of scope

- **A backend, accounts or sync between devices.** That's the whole of Project 3. Adding it here means learning two hard things at once.
- **Multiple boards, labels, due dates or comments.** Each one is more of the same CRUD work. Make one board excellent instead.
- **A drag-and-drop library.** The native API is enough, and you'll understand the libraries better after using it.
- **A virtual DOM or diffing.** Re-rendering the whole board is fast enough for a few hundred cards. Measure before you optimise.

## How to work through it

1. **The model and the loop** (data model, render from state, create/edit/delete): about 5 hours. This is the foundation. If it's right, everything else is quick.
2. **Interaction** (drag and drop, filters and search): about 5 hours.
3. **Making it trustworthy** (persistence, undo, keyboard access): about 5 hours. Each of these is small *because* of how you built phase 1.
4. **Polish** (empty states, transitions, favicon): about 2 hours.

The rule that decides how this goes: **handlers change state and call render; nothing else edits the DOM.** Break it once to save five minutes and you'll lose an evening to a card that shows in one column but lives in another.

## Show it off

Your README should include:

- A GIF of dragging a card, refreshing, and the card staying put
- The state shape (the JSON from the first milestone), with a sentence on why tasks are stored flat
- How undo works, in two sentences
- A note on keyboard support, with the keys

In your demo, unplug the mouse and move a card with only the keyboard. Few student projects can do that.

Resume bullets to adapt (use your own numbers):

- "Built a kanban board in vanilla JavaScript with a single-source-of-truth state model, native drag-and-drop, 10-step undo and full keyboard support"
- "Designed a normalised state shape that cut moving a task to two array operations, so undo became a simple snapshot stack instead of per-action reverse logic"
