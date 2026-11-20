---
id: undo
project: devboard
title: Implement undo for the last 10 actions
summary: >-
  Keep a stack of board snapshots: copy the board with structuredClone before every change, and pop the last copy on Ctrl+Z. Because every change already flows through update, undo works for every action you have, with no per-action code.
time: 1-2 hours
doneWhen:
  - Ctrl+Z (Cmd+Z on a Mac) undoes the last add, edit, delete or move, one step per press
  - After 12 changes, pressing Ctrl+Z 12 times undoes exactly 10 of them and then does nothing
  - Pressing Ctrl+Z while typing in the search box or an edit field undoes text in that field, not the board
  - Typing in the search box or changing the priority filter never adds an undo step
  - Your undo code never mentions a specific action; there is no "un-move" or "un-delete" function
docs:
  - label: "MDN: structuredClone()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
  - label: "MDN: KeyboardEvent.ctrlKey"
    url: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/ctrlKey
  - label: "MDN: KeyboardEvent.metaKey"
    url: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/metaKey
  - label: "MDN: Array.prototype.shift()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
---

## What you're building

Delete a card by accident, press Ctrl+Z, and it's back in the same column and position. Drag one to the wrong place, press Ctrl+Z, and it goes home. Keep pressing to step back through your last ten changes. An Undo button in the toolbar does the same, greyed out when there's nothing left.

If you've kept to the rule that every change goes through `update`, this will be one of the shortest milestones.

## Why it matters

Undo is a feature users notice, and it changes how people use an app: they experiment more and fear mistakes less. It's also an architecture test: when state is scattered across the DOM there's nothing to go back to, and when it's centralised undo is almost free. "How would you add undo?" in an interview is really asking where your state lives, and comparing two approaches shows you've thought about the design.

## Before you start

- **A stack.** A list where you only add to the end and take from the end: last in, first out. A JavaScript array with `push` and `pop` is a stack. The last change you made is the first one undone.
- **`structuredClone(value)`.** Makes a deep copy: a new object with new nested arrays and objects, sharing nothing with the original. A shallow copy like `{ ...state.board }` copies only the top level, so its `columns` array would be the same array you're about to change.
- **Snapshots versus commands.** One way to undo is to store a copy of the state before each change and restore it. The other, the *command pattern*, records each action and writes a matching reverse action ("un-move" puts the card back). Snapshots are simpler and can't get the reverse wrong. Commands use less memory and suit huge documents. For a board of a few hundred cards, snapshots win easily.
- **Modifier keys.** A `keydown` event tells you which modifiers were held: `event.ctrlKey` for Ctrl, `event.metaKey` for Cmd on a Mac, `event.shiftKey` for Shift. `event.key` is the key itself, like `"z"`.

## Build it step by step

### Step 1: Keep the history next to state, not inside it

Create a `history` array in the same module as `state`, but not as a property of `state`. History is a record *about* your state, not part of it. If it lived inside `state`, every snapshot would contain the previous history, which contains the one before, and your save to `localStorage` would grow with every change.

Check it: `JSON.stringify(state)` in the console doesn't contain the word `history`.

### Step 2: Snapshot inside update

At the start of `update`, before the change runs, take `structuredClone(state.board)`. Run the change. Then compare: if the board is unchanged (for this size, comparing `JSON.stringify` of before and after is fine), throw the snapshot away. Otherwise push it onto `history`, and if `history` now holds more than 10 items, drop the oldest with `shift()`.

```text
update(change):
    before = structuredClone(state.board)
    change(state)
    if board differs from before:
        history.push(before)
        if history.length > 10: history.shift()
    save(state)
    render(state)
```

That comparison does two jobs. View-only changes, like typing in the search box, leave `board` alone, so they never create undo steps. And no-ops, like dropping a card back where it started, don't create a step that seems to do nothing.

Snapshot only `board`, not `view`. Users expect Ctrl+Z to bring back a deleted card, not to clear their search.

Check it: make three changes and `history.length` is 3. Type in the search box: still 3.

### Step 3: Write undo()

`undo()` does nothing if `history` is empty. Otherwise it pops the last snapshot, sets `state.board` to it, closes any open editor (`view.editingId = null`, because the task being edited might not exist in the old board), saves and renders.

`undo` doesn't go through `update`. If it did, it would push the current board onto history, and the next Ctrl+Z would undo your undo.

Check it: delete a task, call `undo()` from the console, and the task is back in its original position.

### Step 4: Wire up Ctrl+Z and Cmd+Z

Add one `keydown` listener on `document` in `init`. When Ctrl or Cmd is held and the key is `z` without Shift, call `event.preventDefault()` and `undo()`. Compare `event.key.toLowerCase()` to `"z"`, because Caps Lock turns it into `"Z"`.

One important exception. If focus is in a text field (the search box, an add-task input or the edit form), let the browser handle Ctrl+Z as normal text undo. Check `event.target.closest("input, textarea, select")` and do nothing if it matches. Hijacking text undo inside an input is one of the most annoying things an app can do.

Check it: move a card, press Ctrl+Z, and it goes back. Type "abc" in the search box and press Ctrl+Z. The text changes, and the board doesn't.

### Step 5: Add an Undo button that knows when it's useful

Put an Undo button in the static toolbar that calls `undo()`, and in `render` set its `disabled` property from whether `history` is empty. The button lives outside `#board`, so render updates its `disabled` state without replacing it. Give it a `title` such as "Undo (Ctrl+Z)" so the shortcut is discoverable.

Check it: on a fresh load the button is disabled. Make one change and it's enabled; undo it and it's disabled again.

### Step 6: Retire the delete confirmation

Remember the `confirm("Delete this task?")` from the [create, edit and delete](/development/devboard/task-crud) milestone? Now that a deletion is one keystroke from being reversed, the dialog only slows people down. Remove it, and instead show a small message after a delete, "Task deleted", with an Undo button inside it that calls the same `undo()`. Let it disappear after a few seconds, and hide it as soon as any other change happens: its Undo pops the latest snapshot, which after another change would no longer be the delete.

That message is temporary UI, like the drag indicator, not board data, so it doesn't need to be in `board` and must not be in a snapshot.

Check it: delete a task. No dialog appears, a message does, and clicking its Undo restores the task.

## Common mistakes

- **A shallow copy instead of a deep one.** Symptom: undo "works" for edits to the top level but not for moves; the snapshot's `taskIds` changed along with the live state. Fix: `structuredClone`, which copies every nested array and object.
- **Snapshotting after the change.** Symptom: the first Ctrl+Z seems to do nothing, and every undo lands one step late. Fix: copy the board before the change runs.
- **Undo going through update.** Symptom: pressing Ctrl+Z twice swaps between two states forever. Fix: `undo` sets the board directly, then saves and renders, without pushing to history.
- **Stealing Ctrl+Z from text fields.** Symptom: while editing a title, Ctrl+Z reverts the whole board instead of the last word you typed. Fix: skip your shortcut when the event comes from an input, textarea or select.
- **No cap on the stack.** Symptom: nothing visible at first, but memory grows for as long as the tab is open. Fix: `shift()` the oldest snapshot once there are more than 10.

## Say it in the interview

"Undo is a stack of board snapshots. My `update` function deep-copies the board with `structuredClone` before every change and pushes it if the board actually changed, capped at ten. Ctrl+Z pops the last snapshot and re-renders. I didn't write any per-action undo logic, because every change goes through one function. The tradeoff versus the command pattern is memory: I store ten full copies instead of ten small diffs. I checked with `JSON.stringify(board).length`: even with a few hundred tasks, ten copies are well under a megabyte, and undo can never be wrong about how to reverse something."

## Stretch goals

- Add redo with a second stack: undo pushes the current board onto `future` before restoring; Ctrl+Shift+Z pops from `future`; any new change clears `future`.
