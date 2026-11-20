---
id: data-model
project: devboard
title: Design the data model before any UI
summary: >-
  Decide the exact shape of your board's state before you draw a single card: columns that hold task ids, and tasks in one flat map keyed by id. Get this right and drag-and-drop, undo and saving all become short.
time: 1-2 hours
doneWhen:
  - Your state shape is written down as a comment or a types file before any rendering code exists
  - Tasks live in one object keyed by id, and columns hold only arrays of task ids
  - You can write, in one sentence each, what changes in state for add, edit, delete and move
  - Moving a task between columns only changes two arrays of ids
  - Every value in state is a string, number, boolean, null, array or plain object, with no Dates, Maps or DOM nodes
docs:
  - label: "MDN: Working with objects"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
  - label: "MDN: Array.prototype.splice()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
  - label: "MDN: crypto.randomUUID()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
  - label: "MDN: JSON.stringify()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
---

## What you're building

Nothing you can see yet. You end this milestone with a file, say `state.js`, holding a comment describing the shape of your board's state, and one real state object filled with seed data: three columns and five or six sample tasks. You can type `state` in the browser console and read your whole board as plain data.

It's the most important hour in the project. Every later milestone reads and writes this shape, and the right shape turns each of them into a few lines.

## Why it matters

Most UI bugs are really data-model bugs: the same fact stored in two places, and the two copies drifting apart. Designing state deliberately, before the UI pushes you into whatever is convenient for the first screen, is exactly what interviewers probe when they ask "how would you structure the state for this?" The pattern here, storing items flat by id and pointing to them by id, is how databases store tables too, so it carries straight into Project 3.

## Before you start

- **State.** All the data your app needs to draw the screen at this moment. If you saved it, closed the tab and loaded it again, you should get exactly the same screen. Anything you can work out from other data (like "how many tasks are in Done") is *derived*, and doesn't belong in state.
- **Normalization.** Store each thing once, in a lookup keyed by its id, and point to it by id from everywhere else. A column doesn't contain tasks; it contains a list of task ids. Editing a task then changes one place.
- **Objects for lookup, arrays for order.** A plain object gives you `tasks[id]` in one step. An array keeps things in a definite order. A column's tasks have an order (the top card is first), so that's an array. Finding a task by id doesn't need order, so that's an object.
- **JSON-safe data.** Later you'll save state with `JSON.stringify` and copy it with `structuredClone`. Stick to strings, numbers, booleans, `null`, arrays and plain objects. A `Date` becomes a string in JSON and a `Map` becomes `{}`, which breaks things silently.

## Build it step by step

### Step 1: List what the board must do

Write down every action from the [project brief](/development/devboard): add, edit, delete, move to another column or position, filter by priority, search, undo, save and reload. You'll test your shape against this list in step 5.

Check it: you have a list of eight or so actions in a comment at the top of `state.js`.

### Step 2: Write the shape as a comment

Split state into two parts. `board` is the real data: columns and tasks. `view` is how the user is currently looking at it: the active filters, and which card is being edited. Keeping them apart pays off twice later: undo restores only `board`, and nobody wants Ctrl+Z to undo a search.

```json
{
  "board": {
    "columns": [
      { "id": "todo", "title": "To Do", "taskIds": ["9f1c", "3b7e"] },
      { "id": "doing", "title": "In Progress", "taskIds": ["c41a"] },
      { "id": "done", "title": "Done", "taskIds": [] }
    ],
    "tasks": { "9f1c": { "id": "9f1c", "title": "Fix login bug", "description": "", "priority": "high", "createdAt": 1767225600000 } }
  },
  "view": { "priority": "all", "query": "", "editingId": null }
}
```

(Real ids will be full UUIDs; they're shortened here.) A JSDoc `@typedef` or a `types.ts` file works just as well, as long as it exists before any rendering code.

Check it: someone reading only the comment can tell you which column "Fix login bug" is in.

### Step 3: Decide what is not in the shape

Notice what's missing. A task has no `columnId` field: which column it's in is already recorded by that column's `taskIds`, and storing it twice means two facts that can disagree. There's no `count` on a column either: it's `taskIds.length`, so it's derived. There's no `order` number on tasks: the position in `taskIds` is the order.

Each feels handy now and costs you later, because every update would have to change both copies.

Check it: for every field in your shape, ask "could I compute this from something else in state?" If yes, delete it.

### Step 4: Choose your ids

Tasks get ids from `crypto.randomUUID()`, which returns a random string like `"3b7e…"` that won't repeat. Never use array positions as ids: delete the second task and every task after it gets a new "id", so anything pointing at the old one now points at the wrong task.

Columns are fixed in this project, so give them short readable ids you choose yourself: `"todo"`, `"doing"`, `"done"`. They're easier to read in the console and in `data-column-id` attributes later.

Also store the id inside the task object. It's a small duplicate, but a task passed to a function still knows who it is.

Check it: call `crypto.randomUUID()` in the console twice and get two different strings.

### Step 5: Walk every action through the shape

Go back to your list from step 1 and write one line per action describing what changes, with no real code yet.

```text
add(title, columnId)    -> new id; tasks[id] = {...}; column.taskIds.push(id)
edit(id, changes)       -> change fields on tasks[id] only
delete(id)              -> remove id from its column's taskIds; delete tasks[id]
move(id, toCol, index)  -> splice id out of old taskIds; splice into new taskIds
filter / search         -> change view only; board is untouched
undo                    -> replace board with an earlier copy
save / load             -> JSON.stringify(state) / JSON.parse(text)
```

If any line needs you to loop over every task, copy an object, or change the same fact in two places, your shape is wrong. Fix it now, while fixing it costs nothing.

Check it: "move" touches exactly two arrays and nothing else.

### Step 6: Write the seed data and an invariant check

Create a `createSeedState()` function that returns a fresh state with your three columns and five or six realistic tasks. You'll use it on first load, and later as the fallback when saved data is missing or corrupt. A function that builds a new object each time means nothing can modify the original.

Then write a small `checkBoard(board)` helper for development. It checks the rules your shape depends on: every id in a column's `taskIds` exists in `tasks`, and every task appears in exactly one column, exactly once. Log a loud `console.error` if not. You'll call it after every change from the next milestone on, so bugs show up the moment they happen.

Check it: in the console, push a made-up id into a column's `taskIds` and run `checkBoard(state.board)`. It should complain.

## Common mistakes

- **Nesting task objects inside columns.** Symptom: moving a card means finding it, copying it, deleting it and re-inserting it, and edits sometimes land on a stale copy. Fix: columns hold ids, tasks live in one flat map.
- **Using array indexes as ids.** Symptom: after deleting a task, editing another one changes the wrong card. Fix: `crypto.randomUUID()` when the task is created, and never change it.
- **Storing a task's column on the task as well.** Symptom: a card shows up in Done, but filtering by column says it's still in To Do. Fix: one fact, one place. The column's `taskIds` is the only record of where a task lives.
- **Putting `Date` objects in state.** Symptom: after you add saving, `task.createdAt.getTime is not a function`, because JSON turned the date into a string. Fix: store timestamps as numbers from `Date.now()` and format them only when you display them.
- **Mixing filters into the board data.** Symptom: undo starts reverting your search text, or filters get saved as if they were tasks. Fix: keep `view` separate from `board` from the start.

## Say it in the interview

"Before writing any UI I designed the state. Tasks live in one object keyed by a UUID, and each column holds an ordered array of task ids. That's normalization: every fact is stored once, so moving a task is two splices and editing a task changes one object. I also split the real data from view state like filters, so undo and saving only deal with the board. The tradeoff is that finding which column a task is in means scanning three short arrays instead of reading a field, which is fine at this size and removes a whole class of out-of-sync bugs."

## Stretch goals

- Write the shape in TypeScript (`Board`, `Column`, `Task`, `Priority` as a union of string literals) and let the editor catch typos in field names.
