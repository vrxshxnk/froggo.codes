---
id: drag-and-drop
project: devboard
title: Drag and drop tasks between columns
summary: >-
  Let users drag a card into another column, or to a new spot in the same one, using the browser's built-in Drag and Drop API. Because your state is already the single source of truth, the move itself is a few lines.
time: 3-4 hours
doneWhen:
  - You can drag a card from To Do into Done, and it lands where you dropped it, not just at the bottom
  - You can reorder cards inside one column by dragging
  - While you drag, the column under the cursor visibly shows it will accept the drop
  - Refresh after a drag and the card is still in its new place (once persistence is in)
  - Dropping a card outside any column leaves the board unchanged
  - Your drop handler never edits the DOM directly; it updates state and calls render
docs:
  - label: "MDN: HTML Drag and Drop API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
  - label: "MDN: DataTransfer"
    url: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
  - label: "MDN: Element.getBoundingClientRect()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  - label: "MDN: dragover event"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragover_event
---

## What you're building

At the end of this milestone you can grab any card, drag it across the board, and drop it into any column at any position. While you drag, the column you're hovering over lights up and a thin line shows exactly where the card will land. Let go, and the board redraws with the card in its new home.

You'll use the browser's native Drag and Drop API, not a library. It has one famous trap, and once you've hit it you'll never forget it.

## Why it matters

Drag and drop is where most hand-built UIs fall apart, because the DOM and the data drift out of sync: the card moves on screen, but the data still says it's in the old column. Building it on top of a single state object proves you can keep a complex interaction honest. That's the same discipline React, Redux and every serious front-end codebase depend on. It also shows you can read platform docs and work with an awkward API without reaching for a package.

## Before you start

- **Drag events.** The browser fires a sequence of events during a drag. On the card being dragged you get `dragstart`, then `dragend` when it's released. On whatever is under the cursor you get `dragenter`, `dragover` (many times a second) and `dragleave`, and finally `drop` on the element you release over.
- **`draggable="true"`.** Most elements can't be dragged by default (links and images can). Adding this attribute to a card makes it draggable.
- **`dataTransfer`.** Each drag event carries an `event.dataTransfer` object. You put data in it on `dragstart` with `setData()` and read it on `drop` with `getData()`. Store only the task's id: your state already knows everything else.
- **Event delegation.** Instead of attaching listeners to every card, attach one listener to the board and check `event.target.closest(".card")` to find the card involved. Since `render` replaces cards constantly, listeners on individual cards would be lost on every render.

## Build it step by step

### Step 1: Make the cards draggable and tag them with their id

In your render function, give every card `draggable="true"` and a `data-id` attribute holding the task id. Give every column a `data-column-id`. These attributes are the bridge between the DOM and your state: when an event fires, they tell you which task and which column it involves.

Check it: you can now pick a card up and see a ghost image follow the cursor. Nothing happens on release yet.

### Step 2: Put the task id in the drag on dragstart

Add one `dragstart` listener on the board element. Find the card with `closest`, read its `data-id`, and store it with `event.dataTransfer.setData("text/plain", id)`. Also add a `dragging` class to the card so you can dim it while it's in the air, and remove that class on `dragend`.

Check it: log the id on `dragstart`. It should be the id of the card you grabbed, every time.

### Step 3: Allow the drop (the famous trap)

By default, elements refuse drops. Calling `preventDefault()` in `dragover` is how you tell the browser "this is a valid drop target." Skip it and `drop` never fires. No error appears: it just silently does nothing.

```javascript
board.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-column-id]")) event.preventDefault();
});
```

Only call it when the cursor is over a column, so drops outside a column are refused by the browser for free.

Check it: add a temporary `drop` listener that logs `"dropped"`. It should log when you release over a column and stay silent everywhere else.

### Step 4: Work out where in the column the card should land

Dropping into the right column isn't enough. Users expect the card to land between the two cards they released it between. In `dragover`, compare the cursor's `event.clientY` with the vertical middle of each card in that column (from `getBoundingClientRect()`). The new index is the position of the first card whose middle is below the cursor, or the end of the column if there's none.

```text
for each card in the column (skip the one being dragged):
    middle = card.top + card.height / 2
    if cursorY < middle: return this card's index
return the number of cards   // drop at the end
```

Check it: log the index in `dragover` and move slowly down a column. It should count 0, 1, 2... as you pass each card's middle.

### Step 5: Show where it will land

Feedback is part of the feature: without it, drag and drop feels broken even when it works. While dragging, add a highlight class to the column under the cursor and draw a thin insertion line at the index from step 4. Remove both on `dragleave`, `drop` and `dragend`.

Keep the indicator out of your state. It's temporary UI, not data. Toggling a class or moving one indicator element directly is fine here, because nothing about the board's data changes until the drop. This is the one place where touching the DOM outside `render` is acceptable.

Check it: drag a card slowly over every column. The highlight should follow you and never get stuck on a column you've left.

### Step 6: On drop, update state and render

In the `drop` handler, read the id with `getData("text/plain")`, the target column from `data-column-id`, and the index from step 4. Then call a single state function, something like `moveTask(id, toColumnId, toIndex)`. It removes the id from its current column's `taskIds` and inserts it at the new index with `splice`. Then call `render(state)`.

One subtle case: when you move a card down within the same column, removing it first shifts every index after it by one. Subtract one from the target index in that case, or the card lands one slot too low.

Check it: try all four moves (to another column, to the top of a column, to the bottom, and down by one place within the same column). Then inspect your state in the console: every task id should appear in exactly one column, exactly once.

## Common mistakes

- **Forgetting `preventDefault()` in `dragover`.** Symptom: `drop` never fires, with no error. Fix: call it in `dragover` whenever the cursor is over a valid column.
- **Putting the whole task object in `dataTransfer`.** Symptom: edits made during a drag are lost, or you end up with duplicate tasks. Fix: carry only the id, and let state be the source of truth.
- **Listeners on each card.** Symptom: drag works once, then stops after the first render. Fix: one delegated listener on the board, which `render` never replaces.
- **Moving the DOM node on drop.** Symptom: the card looks right, but refresh or undo puts it back, or filters show it in the old column. Fix: update state and call render. Never `appendChild` a card.
- **The off-by-one inside a column.** Symptom: dragging a card down one slot does nothing, or it lands one place too far. Fix: adjust the index when the source and target column are the same and the old index is above the new one.

## Say it in the interview

"Drag and drop only ever changes state. The drop handler reads the task id, works out the target column and index, and calls one `moveTask` function that splices two id arrays. Then the board re-renders. Because tasks are stored flat by id, that's the whole move, and undo and persistence handle it with no extra code. I used the native API instead of a library. The tradeoff is that it doesn't support touch screens, so on mobile I fall back to a 'Move to...' menu, which I also needed for keyboard users anyway."

## Stretch goals

- Let users drag whole columns to reorder them, using the same index logic horizontally with `clientX`.
- Add touch support with Pointer Events (`pointerdown`, `pointermove`, `pointerup`), which work for mouse, pen and touch.
- Auto-scroll the column when a card is dragged near its top or bottom edge.
