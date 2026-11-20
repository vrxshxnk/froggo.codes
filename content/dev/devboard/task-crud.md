---
id: task-crud
project: devboard
title: Create, edit, and delete tasks
summary: >-
  Add tasks from a form, edit them inline by clicking the title (Enter saves, Escape cancels), and delete them, all by changing state and re-rendering. Ids come from crypto.randomUUID(), never array positions.
time: 2-3 hours
doneWhen:
  - Typing a title and pressing Enter adds a card to the right column, and an empty or all-spaces title adds nothing
  - Clicking a card's title turns it into an input with the text selected; Enter saves the change and Escape puts the old title back
  - Pressing Escape during an edit never saves the half-typed text, even though the input loses focus
  - Deleting a card removes its id from its column and its entry from tasks, and checkBoard reports no problems
  - Every new task has a UUID id, and deleting the second task never changes the id of the third
docs:
  - label: "MDN: crypto.randomUUID()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
  - label: "MDN: HTMLFormElement submit event"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
  - label: "MDN: KeyboardEvent.key"
    url: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  - label: "MDN: focusout event"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/focusout_event
---

## What you're building

Each column gets an "Add a task" input at the bottom. Type a title, press Enter, and a card appears. Click a card's title and it turns into a text box with the title selected, plus a priority picker and a description box. Enter saves, Escape backs out. Each card also has a delete button. Every one of these is a change to state followed by a render.

There are no modals. Editing happens right where the card is, which is faster to use and simpler to build.

## Why it matters

Create, read, update, delete (CRUD) is most of what most apps do, and it's where small mistakes in ids, validation and focus handling show up as real user frustration. Getting inline editing right, including Escape, blur and an empty title, shows you think beyond the happy path. An editable list like this is also a common machine-coding interview task.

## Before you start

- **Forms and the `submit` event.** Wrap an input in a `<form>` and Enter submits it, no key handling needed. Listen for `submit` and call `event.preventDefault()` so the page doesn't reload.
- **`crypto.randomUUID()`.** Returns a new random id string each time you call it. It only exists in a *secure context*: pages on `https://` or `localhost`. That matters later if you open your dev server from your phone over Wi-Fi (see Common mistakes).
- **View state for editing.** Which card is being edited is a fact about the screen, so it belongs in `state.view.editingId` from your data model. Render draws an input for that card and a plain title for the rest.
- **Focus events.** `focusout` fires when focus leaves an element, and bubbles, so one delegated listener on the board catches it. Its `event.relatedTarget` says where focus is going next: that's how you tell "clicked elsewhere" from "moved to the next field."

## Build it step by step

### Step 1: Add tasks with a form per column

In `renderColumn`, add a small `form` at the bottom of each column with one text input and a hidden or visible "Add" button. Give the form a `data-column-id` so the handler knows where the task goes.

Your delegated `submit` handler trims the text and, if anything is left, calls `update` with a change that creates the task. Write that change as a named function, `addTask(state, columnId, title)`, so other features can reuse it.

```json
{ "id": "a8d0f2c4-…", "title": "Write README", "description": "", "priority": "medium", "createdAt": 1767225600000 }
```

The change adds this object to `tasks` and pushes its id onto the column's `taskIds`. Nothing else.

Check it: add three tasks to In Progress. They appear in order, the input clears, and `checkBoard` stays quiet.

### Step 2: Keep the input's focus after adding

Because `render` replaces the whole board, the input you typed in is gone, and with it the focus. Fix it: remember which column's form you submitted from, and call `.focus()` on that column's new input once `render` has run. You'll need this "restore focus after render" pattern again for editing and, heavily, for keyboard support, so make it a small helper.

Check it: type a title, press Enter, type another, press Enter. You never touch the mouse.

### Step 3: Start editing on click

Clicking a card's title sets `state.view.editingId` to that task's id, through `update` like everything else. In `renderCard`, if the task's id equals `editingId`, draw a small form instead of the plain title: a text input with the current title, a `select` for priority (low, medium, high), a `textarea` for the description, and a Save button. After render, focus the title input and call `.select()` on it so typing replaces the old text.

Check it: click a title. It becomes an input with the text highlighted. Inspect `state.view.editingId` in the console: it's that task's id. Only one card can ever be in edit mode, because there's only one `editingId`.

### Step 4: Commit with Enter, cancel with Escape

Submitting the edit form (pressing Enter in the title input) commits: if the trimmed title is empty, treat it as a cancel; otherwise write the new title, priority and description to `tasks[id]` and set `editingId` back to `null`, all in one `update`.

Escape cancels: listen for `keydown` with `event.key === "Escape"` and set `editingId` to `null` without touching the task.

Clicking somewhere else should save, like most editors. On `focusout` from the edit form, check `event.relatedTarget`: if focus is moving to another field in the same form, do nothing. Commit only when focus leaves the form.

```text
on focusout from the edit form:
    if relatedTarget is inside the same form: ignore
    if state.view.editingId is no longer this task: ignore   // already saved or cancelled
    otherwise: commit
```

The second check is the one everybody misses. Escape sets `editingId` to `null` and renders, which removes the input, which fires `focusout`, which would commit the text you just cancelled.

Check it: change a title and press Escape. The old title is back. Change it again and click on empty board space. The new title is saved.

### Step 5: Delete tasks

Add a delete button to each card, with `data-action="delete"` and an `aria-label` like "Delete task: Fix login bug", so a screen reader doesn't just hear "×". The change removes the id from its column's `taskIds` with `splice` and deletes `tasks[id]`. Write a small helper to find which column holds an id; moves reuse it.

For now, ask `confirm("Delete this task?")` first. Once undo exists, you can drop the confirmation, because a mistake is one Ctrl+Z away.

Check it: delete a task in the middle of a column. The others close the gap, `checkBoard` is silent, and the deleted id appears nowhere in `state`.

### Step 6: Validate at the edges

Enforce your rules in the change functions, not just the inputs, so every path obeys them. Titles are trimmed and can't be empty. Set a maximum, such as 120 characters, with `maxlength` on inputs and a check in `addTask`. Priority must be one of your three values.

Then try a title of only spaces, a 500-character paste, and `<script>alert(1)</script>`.

Check it: the first adds nothing, the second is cut to your limit, and the third shows up as plain text.

## Common mistakes

- **Escape saves anyway.** Symptom: you press Escape, the card closes, and the half-typed title is saved. Fix: in the `focusout` handler, do nothing if `editingId` is no longer this task's id.
- **Deleting from only one place.** Symptom: `Cannot read properties of undefined (reading 'title')` in `renderCard`, because a column still lists an id whose task is gone. Fix: delete removes the id from `taskIds` and the entry from `tasks`, in the same change. `checkBoard` catches this instantly.
- **`crypto.randomUUID is not a function`.** Symptom: adding works on your laptop but throws on your phone when you open the dev server at `http://192.168.x.x:5173`. That address isn't a secure context. Fix: test on your phone through the deployed HTTPS site, or tunnel to `localhost`.
- **Committing on every keystroke.** Symptom: once undo exists, Ctrl+Z steps back one letter at a time, and the cursor jumps because each keystroke re-renders. Fix: keep the draft in the input itself and write to state only on commit.
- **A blur handler that fires between fields.** Symptom: clicking from the title to the priority picker closes the editor. Fix: check `relatedTarget` and ignore focus moving within the same form.

## Say it in the interview

"Editing is inline: clicking a title puts that task's id in `view.editingId`, and render draws a form instead of the text. Enter commits, Escape cancels, and clicking away commits. The bug I hit was that cancelling removes the input, which fires `focusout`, which saved the text anyway, so the blur handler now checks the edit is still open. I chose inline editing over a modal to keep users in place; the tradeoff is fiddlier focus handling."

## Stretch goals

- Let users press Ctrl+Enter in the description box to save, since plain Enter there should insert a new line.
