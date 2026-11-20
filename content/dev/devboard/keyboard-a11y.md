---
id: keyboard-a11y
project: devboard
title: Make it keyboard-accessible
summary: >-
  Make every mouse action possible from the keyboard: Tab to any card, Enter to edit, Delete to remove, and a Move menu or arrow-key shortcuts to change columns. The moves call the same moveTask function as drag-and-drop, so the real work is focus, not state.
time: 2-3 hours
doneWhen:
  - With the mouse unplugged, you can add a task, edit it, move it to Done and delete it
  - Every card and button shows a clearly visible outline when it has keyboard focus
  - After moving a card with the keyboard, focus is still on that same card in its new place
  - A screen reader, or the aria-live region in DevTools, announces each move, such as "Moved Fix login bug to Done"
  - The Move menu opens with Enter, works with the arrow keys, and closes with Escape, returning focus to its button
docs:
  - label: "MDN: tabindex"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex
  - label: "MDN: :focus-visible"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
  - label: "MDN: aria-live"
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live
  - label: "W3C ARIA Authoring Practices: Menu Button pattern"
    url: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
  - label: "W3C WAI: Keyboard accessibility (WCAG 2.1.1)"
    url: https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
---

## What you're building

Put the mouse away. Tab moves through the search box, the filters and then the cards, with a bold outline showing where you are. Enter edits a card, Delete removes it, Ctrl+Z brings it back. Shift+Right Arrow hops the card into the next column with focus still on it, so pressing it again sends it to Done. Each card also has a "Move" button that opens a short menu: the other columns, "Move up" and "Move down". A screen reader user hears what happened after every move.

## Why it matters

Many people never use a mouse: people with motor impairments, screen reader users, and developers who prefer the keyboard. The Web Content Accessibility Guidelines (WCAG), which many accessibility laws and policies refer to, require that everything a page does works from a keyboard. Drag-and-drop is the classic feature that fails this, so a kanban board that passes is unusual, and a concrete answer to accessibility questions in front-end interviews.

## Before you start

- **Focus and tab order.** The element that receives key presses has *focus*. Tab moves it forward through focusable elements in page order, Shift+Tab moves back. Buttons, links and inputs are focusable already; an `li` becomes focusable with `tabindex="0"`. Never use a positive `tabindex`, which reorders the page unpredictably.
- **Visible focus.** Browsers draw a focus outline by default, and many stylesheets remove it with `outline: none`. The `:focus-visible` selector targets keyboard focus, so you can style a strong outline without it flashing on every mouse click.
- **Live regions.** Screen readers read out any text that appears in an element with `aria-live="polite"`, once they finish what they're saying. Write "Moved Fix login bug to Done" into it, and a screen reader user hears the result of an action they can't see.
- **The menu button pattern.** The W3C's ARIA Authoring Practices describe exactly how a button that opens a menu should behave with the keyboard and to a screen reader. You'll follow it in step 5.

## Build it step by step

### Step 1: Unplug the mouse and write down what fails

Before you change anything, unplug your mouse (or turn off the trackpad) for ten minutes and try to add, edit, move to Done and delete a task. Write down every point where you got stuck or lost track of focus.

Check it: you have a list. It probably includes "couldn't reach the cards" and "couldn't move a card".

### Step 2: Make cards focusable and focus visible

In `renderCard`, give each card `tabindex="0"` and an accessible name by pointing `aria-labelledby` at its title element. Every icon-only button (delete, Move) needs an `aria-label`.

Then write a `:focus-visible` style for cards and buttons: a thick, high-contrast outline, offset a couple of pixels. Remove any `outline: none` in your CSS or replace it with something visible.

Check it: Tab from the top of the page. You can always see where focus is, and you reach every card in order.

### Step 3: Add keyboard actions on a focused card

Add one `keydown` listener on `#board` (delegated, as always). When the event comes from a card itself, not from an input inside it:

```text
Enter             -> start editing this card (same change as clicking the title)
Delete            -> delete this card (Backspace too, on Macs without a Delete key)
Shift+ArrowLeft   -> moveTask(id, previous column, end)
Shift+ArrowRight  -> moveTask(id, next column, end)
Shift+ArrowUp     -> moveTask(id, same column, index - 1)
Shift+ArrowDown   -> moveTask(id, same column, index + 1)
```

Each calls a change function you already have. `moveTask` is the one your [drag and drop](/development/devboard/drag-and-drop) handler calls, so keyboard moves save, undo and filter correctly with no new state code. Call `event.preventDefault()` for keys you handle, so the page doesn't scroll on arrow keys.

Why Shift? Alt+Left Arrow is the Back shortcut in Chrome and Firefox on Windows and Linux, and Ctrl+arrows switch desktops on macOS.

Check it: focus a card, press Shift+Right Arrow, and look at the board. The card is in the next column. (Focus is lost. That's the next step.)

### Step 4: Put focus back after every render

This step makes or breaks it. `render` replaces every card, so the focused element no longer exists and focus drops to the page body: a keyboard user who just moved a card is back at the top of the page.

Fix it in one place. Before rendering, note the focused card's `data-id`. After rendering, find the element with that `data-id` and call `.focus()` on it. Decide what gets focus after each kind of change:

```text
after move or edit:  the same card
after delete:        the next card in that column, else the previous, else the column's add input
after undo:          the card that was focused, if it still exists, else the first card
```

Generalise your add-task focus helper and call it at the end of `update` and `undo`.

Check it: press Shift+Right Arrow twice on a card in To Do. It ends up in Done, and the outline stayed on it the whole way.

### Step 5: Build the Move menu

Shortcuts are invisible, so also give each card a "Move" button that opens a list of actions: the other columns, plus "Move up" and "Move down" where they make sense. Follow the menu button pattern: the button has `aria-haspopup="menu"` and `aria-expanded`, the list has `role="menu"`, each choice has `role="menuitem"`, Up and Down arrows move between items, Enter chooses, and Escape closes the menu and returns focus to the button.

Which menu is open is view state, like `editingId`: keep it in `view.menuFor`, so render draws it and a render while it's open doesn't lose it. When it opens, move focus to the first item.

This is also the "Move to..." menu the drag-and-drop milestone names as the touch-screen fallback.

Check it: Tab to a card's Move button, press Enter, Down Arrow twice, Enter. The card moves, the menu closes, and focus is on the card.

### Step 6: Announce what happened

Add a visually hidden element with `aria-live="polite"` to your static HTML, outside `#board`. (Visually hidden means moved off-screen with CSS, not `display: none`, which hides it from screen readers too.) After every move, delete and undo, write a short sentence into it: "Moved Fix login bug to Done, position 2 of 3." Do this in the handlers, not in render, so typing in search doesn't trigger announcements.

Check it: turn on a screen reader (VoiceOver with Cmd+F5 on a Mac, Narrator with Ctrl+Windows+Enter on Windows), move a card, and listen.

## Common mistakes

- **Focus disappears after every action.** Symptom: you move a card, and the next Tab press starts from the top of the page. Fix: remember the focused card's id before render and focus it again afterwards, in one helper called from `update`.
- **Card shortcuts fire while typing.** Symptom: pressing Backspace in the edit field deletes the whole card. Fix: only handle card keys when `event.target` is the card itself, not an input inside it.
- **Removing the focus outline.** Symptom: everything works, but you can't tell which card is focused, so it's unusable in practice. Fix: never `outline: none` without a visible `:focus-visible` replacement.
- **A live region inside the board.** Symptom: announcements are never read, because render replaces the region each time. Fix: put it in static HTML, present before you write to it.
- **`div`s with click handlers instead of buttons.** Symptom: the delete "button" can't be reached with Tab or pressed with Enter. Fix: a real `button` element does both for free.

## Say it in the interview

"Every mouse action has a keyboard path. Cards are focusable, Enter edits, Delete removes, and Shift plus the arrow keys move a card, or there's a Move menu that follows the W3C menu button pattern. All of those call the same `moveTask` as drag-and-drop, so the state side was free. The real work was focus: because I re-render the whole board, I had to restore focus to the right card after each change. The tradeoff with shortcuts is that nobody can see them, which is why the visible Move menu exists too."

## Stretch goals

- Let plain Up and Down arrows move focus between cards in a column, and Left and Right between columns, using a *roving tabindex* so the board is a single Tab stop.
