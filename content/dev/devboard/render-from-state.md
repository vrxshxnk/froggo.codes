---
id: render-from-state
project: devboard
title: Render the whole board from state
summary: >-
  Write one render(state) function that draws the entire board from your state object, and route every change through one update function. This is the loop every later feature plugs into, and it's the idea React is built on.
time: 2-3 hours
doneWhen:
  - Changing a task title in the console and calling render() updates the card on screen
  - Reordering a column's taskIds in the console and calling render() reorders the cards
  - No event handler in your code calls appendChild, remove or innerHTML on the board; they all go through update
  - The board has exactly one set of listeners, attached once at startup, and they still work after ten renders
  - A task titled with `<b>hi</b>` shows those characters literally instead of bold text
docs:
  - label: "MDN: Document.createElement()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
  - label: "MDN: Element.replaceChildren()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren
  - label: "MDN: Node.textContent"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  - label: "MDN: Element.closest()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
  - label: "react.dev: Reacting to input with state"
    url: https://react.dev/learn/reacting-to-input-with-state
---

## What you're building

Your seed board appears on screen: three columns, each with a heading, a count and its cards in order. Nothing is clickable yet, but the board is drawn entirely by one function, `render(state)`, which rebuilds it from scratch. Change the state, call `render`, and the screen matches.

You'll also write `update`, the one function every change goes through. Later milestones add saving and undo inside it, which is why they end up short.

## Why it matters

Keeping what's on screen in sync with your data is the central problem of front-end work. Handlers that poke at the DOM directly work for a demo and fall apart once two features touch the same element. "UI is a function of state" is the answer modern frameworks settled on, and building it by hand once means you can explain what React is doing for you instead of reciting it.

## Before you start

- **The DOM.** The browser's live tree of elements, built from your HTML. JavaScript can create elements with `document.createElement("li")`, set their text with `textContent`, and put them on the page. What you see on screen is the DOM.
- **Re-rendering.** Instead of finding the right card and changing it, you throw away the board's contents and rebuild them from state. It sounds wasteful, but it can never leave the screen out of date.
- **Event delegation.** Events bubble up from the element you clicked through its parents. One listener on the board can handle clicks on any card by checking `event.target.closest(".card")`. Since `render` replaces the cards constantly, listeners on individual cards would vanish; one listener on the board survives.
- **`textContent` versus `innerHTML`.** `textContent` treats a string as plain text. `innerHTML` parses it as HTML. If a task title is `<img src=x onerror=alert(1)>`, `innerHTML` runs it. That's cross-site scripting (XSS).

## Build it step by step

### Step 1: Set up the project and split static from rendered

Create the project with Vite and choose the vanilla JavaScript template (or React, if that's your choice).

```bash
npm create vite@latest devboard
cd devboard && npm install && npm run dev
```

In `index.html`, write the parts of the page that never change: a header with the app name, a toolbar area for the search box and filters you'll add later, and one empty element for the board, such as `<main id="board">`. Your `render` function owns only that element. Everything outside it is static HTML, written once.

This split matters: if `render` redrew the search box too, you'd lose the cursor on every letter.

Check it: the page loads with a header and an empty board area, and `document.querySelector("#board")` in the console finds it.

### Step 2: Write render(state) as a few small functions

`render(state)` builds one element per column and calls `boardElement.replaceChildren(...)` with them, replacing whatever was there. Split the work so each function is short and does one thing:

```text
render(state):
    columns = for each column in state.board.columns: renderColumn(column, state)
    board.replaceChildren(...columns)

renderColumn(column, state):
    section with data-column-id, a heading, a count, and a list
    for each id in column.taskIds: add renderCard(state.board.tasks[id])

renderCard(task):
    list item with data-id = task.id, the title, the priority
```

Use semantic elements: a `section` per column with an `h2`, a `ul` of cards, an `li` per card. Screen readers then announce "list, 3 items" for free. Set all user text with `textContent`.

Check it: your seed board appears, with every card in the column and order your state says.

### Step 3: Keep render honest

`render` has rules. It reads state; it never changes it. It creates elements; it never attaches event listeners. It doesn't fetch, save or log anything you care about. Given the same state, it always produces the same board.

If `render` quietly fixed up state as it drew, you couldn't trust a saved copy, and undo would restore something different from what you saw.

Check it: call `render(state)` five times in a row in the console. Nothing changes, nothing duplicates, and no errors appear.

### Step 4: Attach listeners once, with delegation

Write an `init()` function that runs once on page load. It attaches listeners to the `#board` element (and to the static toolbar later), then calls `render` for the first time. Never attach listeners inside `render`.

To know what a click means, put the information on the elements when you render them: `data-id` on each card and `data-action="delete"` on a button inside it. The listener reads `event.target.closest("[data-action]")`, then its `dataset.action`, and the card's `dataset.id`. That one listener can serve every button on every card, now and after any number of renders.

Check it: add a temporary click listener that logs the clicked card's id. Call `render` ten times in the console, then click a card. It should log exactly once.

### Step 5: Route every change through update

Write `update(change)`, where `change` is a small function that modifies state. `update` runs it, then calls `render(state)`. Every handler you write from now on does exactly one thing: call `update` with the change it wants.

```text
handler (click, drop, key, submit)
    -> update(change)
         -> change(state)          // the only place state is modified
         -> checkBoard(state.board) // in development
         -> render(state)
```

It feels like ceremony now. But saving and the undo snapshot will both go in here, and no handler will have to remember either.

Check it: search your code for `appendChild`, `.remove()` and `innerHTML`. The only matches should be inside your render functions.

### Step 6: Prove the screen follows the state

Expose state on `window` while developing (`window.state = state`) so you can poke at it. Then try these in the console:

- Change `state.board.tasks[someId].title`, then call `render(state)`. The card's text changes.
- Reverse a column's `taskIds` array, then render. The cards reverse.
- Move an id from one column's `taskIds` to another's by hand, then render. The card moves.

If all three work, drag-and-drop, filters and undo are just different ways of changing state. Also measure: wrap `render` in `console.time("render")` and `console.timeEnd("render")`, generate a few hundred fake tasks, and note how many milliseconds a full redraw takes on your machine. Put that number in your README.

Check it: all three console experiments update the screen correctly.

### If you're using React

Keep the whole state in one `useReducer` at the top of the app; the reducer plays the part of `update`, and `Board`, `Column` and `Card` components replace your render functions. Use the task id as each card's `key`, never the array index. Handlers dispatch an action and never touch the DOM.

## Common mistakes

- **Attaching listeners inside render.** Symptom: a click fires two, three, then ten times, because every render added another listener to the board. Fix: attach listeners once, in `init`, to elements `render` never replaces.
- **Building cards with `innerHTML` and template strings.** Symptom: a task titled `<b>hi</b>` shows up bold, which means a malicious title can run code. Fix: `createElement` plus `textContent` for any text a user typed.
- **Letting render own the toolbar.** Symptom: once search exists, every letter you type loses focus, so you can only type one character at a time. Fix: render redraws only `#board`; inputs live in static HTML.
- **A handler that "just" edits the DOM.** Symptom: the card shows the new title, but after the next render it reverts, because state was never changed. Fix: every handler calls `update`; render is the only code that writes to the board.

## Say it in the interview

"The board is drawn by one `render(state)` function that rebuilds it from scratch, and every handler only calls an `update` function that changes state and re-renders. It's the same model React uses, without the diffing. The tradeoff is that I redraw everything on each change instead of patching one card. I measured it at a few milliseconds for a few hundred cards, so the simplicity is worth it. If it ever got slow, I'd move to keyed updates rather than start editing the DOM from handlers."

## Stretch goals

- Write a tiny `h(tag, attributes, children)` helper so building elements in `renderCard` reads like a tree. This is roughly what JSX compiles to.
- Show a column's count as "3" normally and "2 of 3" once filters exist, computed inside render from state.
