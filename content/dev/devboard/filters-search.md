---
id: filters-search
project: devboard
title: Add filters and instant search
summary: >-
  Add a priority filter and a search box that narrow the board as you type. Filters are derived state: you store the settings, apply them inside render, and never delete or hide tasks in the data.
time: 1-2 hours
doneWhen:
  - Typing in the search box narrows the cards with every keystroke, and the box never loses focus
  - Choosing "High" in the priority filter shows only high-priority cards, and choosing "All" brings every card back
  - While a filter is on, state.board.tasks still contains every task (check in the console)
  - Each column shows how many of its cards are visible, such as "2 of 5", while a filter is on
  - Dragging a card while filtered drops it next to the visible card you aimed for, and checkBoard stays quiet
docs:
  - label: "MDN: input event"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event
  - label: "MDN: Array.prototype.filter()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  - label: "MDN: String.prototype.toLowerCase()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase
  - label: "MDN: performance.now()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
---

## What you're building

A toolbar above the board gets two controls: a search box and a priority dropdown (All, High, Medium, Low). Type "login" and, letter by letter, only cards whose title or description contain "login" remain. Pick "High" and only urgent cards show. The two combine. Each column's count changes to "1 of 4" so you know cards are hidden rather than gone, and clearing both controls brings the full board back.

Nothing is ever removed from your data. The board just draws less of it.

## Why it matters

The idea here is *derived state*: what's on screen is computed from the real data plus some settings, not stored separately. Developers who miss it end up keeping a second "filtered tasks" array in sync with the first, and the two drift apart the moment someone edits a card while a filter is on. Knowing what to store and what to compute is one of the clearest signals of front-end maturity, and in React it's the difference between a clean component and a tangle of `useEffect` calls.

## Before you start

- **Derived state.** A value you can always compute from other state. The list of visible cards is derived: it's `taskIds` filtered by the current settings. Store the settings (`view.priority`, `view.query`), and compute the list every time you render.
- **The `input` event.** Fires on a text box every time its value changes: each keystroke, a paste, a cut. That's what "as you type" means. `change` only fires when the box loses focus, and `keyup` misses pastes from the mouse.
- **Case-insensitive matching.** "Login" and "login" should both match. Lowercase both the query and the text with `toLowerCase()` before comparing with `includes()`. Trim the query, so a stray space doesn't hide everything.
- **Debouncing.** Waiting until the user pauses typing (say 150 ms) before doing the work. It's useful when each keystroke triggers something slow, like a network request. Filtering a few hundred cards in memory isn't slow, so you probably don't need it. Measure first.

## Build it step by step

### Step 1: Add the controls to the static toolbar

Put a search `input` (type `search`, with a visible label or an `aria-label` of "Search tasks") and a priority `select` in the toolbar from your render milestone. They go in static HTML, outside `#board`, so render never replaces them and focus stays put while you type.

Check it: the controls appear above the board and do nothing yet.

### Step 2: Store the settings in view state

Listen for `input` on the search box and `change` on the select, once, in `init`. Each handler calls `update` with a change that writes the new value to `state.view.query` or `state.view.priority`. That's all they do. They don't loop over tasks, and they don't touch cards.

Check it: type "abc" and inspect `state.view` in the console. `query` is `"abc"`, and the board hasn't changed yet.

### Step 3: Write one matching function

Write `matches(task, view)`, which returns `true` if a task should be shown. A task passes if the priority filter is "all" or equals the task's priority, and the trimmed, lowercased query is empty or appears in the lowercased title or description.

```text
matches(task, view):
    if view.priority != "all" and task.priority != view.priority: return false
    q = lowercase(trim(view.query))
    if q is empty: return true
    return lowercase(task.title) contains q  or  lowercase(task.description) contains q
```

Keep it a pure function, so you can test it in the console with a fake task and a fake view without touching the board.

Check it: `matches({ title: "Fix Login", description: "", priority: "high" }, { priority: "all", query: "LOGIN " })` returns `true`.

### Step 4: Apply it inside render

In `renderColumn`, filter the column's `taskIds` through `matches` before drawing cards. The data isn't modified: you're choosing what to draw. While you're there, compute both counts and show "2 of 5" when they differ, or just "5" when nothing is hidden.

This is where your earlier discipline pays off. Edits, deletes and moves made while a filter is on all just work, because they change `board` and render applies the filter again on the way out.

Check it: search for something, then edit one of the visible cards so it no longer matches. It disappears. Clear the search, and it's there with the new title.

### Step 5: Fix drag-and-drop for a filtered column

Here's the trap. Your drop logic from [drag and drop](/development/devboard/drag-and-drop) works out an index by looking at the cards on screen. With a filter on, the screen shows only some of the column's tasks, so "index 1 among visible cards" might be index 4 in the real `taskIds`. Insert at 1 and the card lands in the wrong place, hidden among cards you can't see.

The fix is to think in ids, not positions. Instead of the index, find the id of the visible card the drop lands *before* (or none, if it's the end). Then insert just before that id in the full array, or right after the last visible card if you're at the end.

```text
beforeId = id of the first visible card whose middle is below the cursor, or null
if beforeId: index = position of beforeId in column.taskIds
else:        index = position of the last visible card + 1   (or the end if none are visible)
```

When no filter is on, this gives exactly the same result as before, so you can use it all the time.

Check it: filter to "High", drag a high card between two others in another column, then clear the filter. It sits between those same two cards.

### Step 6: Measure before you debounce

The hint says debounce only if you notice lag, so find out. In the console, generate 1,000 fake tasks into one column, then wrap your render in `performance.now()` calls and log how long it takes while you type. If each render is a few milliseconds, typing feels instant and a debounce would only make it feel slower. If it's tens of milliseconds and typing stutters, add a short debounce to the search handler only.

Check it: you have a real number for "render time with 1,000 tasks" in your notes. It's a good line for your README.

## Common mistakes

- **Filtering by deleting.** Symptom: after clearing the search, the tasks that didn't match are gone for good, or come back only after a refresh. Fix: never change `board` to filter. Store the settings and filter in render.
- **Keeping a separate `filteredTasks` array.** Symptom: you edit a card while searching and the change doesn't show, or shows only after you type another letter. Fix: compute the visible list in render every time; never store it.
- **The search box loses focus on every keystroke.** Symptom: you can type one letter, then have to click the box again. Fix: the toolbar lives outside the element render replaces.
- **Dropping by visible index.** Symptom: with a filter on, a dragged card lands in a random-looking spot once you clear the filter. Fix: anchor the drop on the id of the neighbouring card, as in step 5.
- **Undo reverts your search.** Symptom: once undo exists, Ctrl+Z clears the search box instead of undoing the last edit. Fix: filters live in `view`, and undo only snapshots `board`.

## Say it in the interview

"Filters are derived state. I store only the settings, the priority and the query, and render runs each column's ids through one `matches` function before drawing. Tasks are never deleted or copied to hide them, so editing or moving a card while filtered just works. The subtle bug was drag-and-drop: the drop index came from visible cards, so I switched to anchoring on the neighbour's id. I didn't debounce search, because I measured render at a few milliseconds with a thousand tasks, and a debounce would only have added delay."

## Stretch goals

- Mirror the filters in the URL with `URLSearchParams` and `history.replaceState`, so a filtered view can be bookmarked or shared.
- Highlight the matching part of each title, using `textContent` on separate elements so you never build HTML from user text.
- Add a "Clear filters" button that only appears when a filter is on.
