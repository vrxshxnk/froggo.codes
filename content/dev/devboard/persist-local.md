---
id: persist-local
project: devboard
title: Persist everything to localStorage
summary: >-
  Save the whole state to localStorage after every change and load it on startup, with a safe fallback to seed data when the saved copy is missing or corrupt. Because every change already goes through update, saving is one line in one place.
time: 1-2 hours
doneWhen:
  - Add, edit, move and delete a few tasks, refresh, and the board is exactly as you left it
  - Saving happens in exactly one place in your code, inside update
  - Replacing the saved value with `{oops` in DevTools and refreshing loads the seed board, with a warning in the console and no crash
  - Deleting every task and refreshing gives an empty board, not the seed tasks again
  - Your storage key includes a version, such as devboard-v1
docs:
  - label: "MDN: Window.localStorage"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  - label: "MDN: Web Storage API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
  - label: "MDN: JSON.parse()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  - label: "Chrome DevTools: View and edit local storage"
    url: https://developer.chrome.com/docs/devtools/storage/localstorage
---

## What you're building

Close the tab, reopen it tomorrow, and your board is exactly where you left it: same cards, same columns, same order, even the same filter. If the saved data is ever damaged, by a bug, an old version of your app or someone editing it by hand, the app shrugs, loads a fresh sample board and carries on instead of showing a blank white page.

There's no server. The browser's `localStorage` holds a single string: your state, as JSON.

## Why it matters

Any app that stores data has to answer three questions: when do we save, how do we load, and what happens when the stored data isn't what we expect? Getting the third one right is what separates a demo from something people can rely on. Versioning the storage key is a small version of the same idea as database migrations: the shape of your data will change, and old copies of it will still be out there. Being able to explain how you'd handle that is a strong interview answer.

## Before you start

- **`localStorage`.** A small key-value store the browser keeps for each website, which survives refreshes and restarts. Keys and values are always strings. `setItem(key, value)` writes, `getItem(key)` reads and returns `null` if the key doesn't exist. It's synchronous: the call finishes before the next line runs.
- **Serializing.** Turning an object into a string so it can be stored, with `JSON.stringify(state)`. *Hydrating* is the reverse: reading the string back and turning it into live state with `JSON.parse(text)`. This is why your data model sticks to plain JSON-safe values.
- **`try...catch`.** `JSON.parse` throws a `SyntaxError` on invalid JSON. `setItem` can throw too, if storage is full (a `QuotaExceededError`) or blocked by the browser's privacy settings. Wrapping these calls lets you handle the failure instead of crashing.
- **Seed data.** The `createSeedState()` function from your data model. It's what a brand-new user sees, and it's your safe fallback.

## Build it step by step

### Step 1: Pick a versioned key

Define one constant, `STORAGE_KEY = "devboard-v1"`, and use it everywhere. The `-v1` is a promise to your future self. When you change the shape of state (say, priorities become numbers), you bump it to `devboard-v2`, and old saved data is never fed to code that doesn't understand it.

Check it: the string `"devboard-v1"` appears exactly once in your code.

### Step 2: Save inside update

Add one line at the end of `update`, after the change and before or after render: write `JSON.stringify(state)` to `localStorage` under your key. Wrap it in `try...catch`, and if it fails, show a small, non-blocking message ("Couldn't save. Changes may be lost if you close this tab") rather than throwing.

That's the whole save feature. Every handler already goes through `update`, so every change is saved and no handler has to remember. If you had let handlers edit the DOM directly, you'd now be hunting through every one of them to add a save call.

Save the whole state, `view` included, so the filter you had on survives a refresh too. The one exception: don't bring back an open editor. When you load, set `view.editingId` to `null`.

Check it: add a task, then open DevTools, go to Application, then Local storage, and find your key. The JSON includes the new task.

### Step 3: Load on startup, defensively

Write `loadState()` and call it once in `init`, before the first render. It has four outcomes, and you should handle each deliberately:

```text
loadState():
    text = read STORAGE_KEY            (inside try: reading can throw too)
    if text is null:            return createSeedState()    // first visit
    data = JSON.parse(text)             (inside try)
    if parse failed:            warn, return createSeedState()
    if not isValidState(data):  warn, return createSeedState()
    return data
```

`isValidState` checks the basics your app relies on: `board.columns` is an array, `board.tasks` is an object, each column has an `id` and a `taskIds` array, and every id in `taskIds` exists in `tasks`. You already wrote most of this as `checkBoard`. Reuse it.

Check it: refresh a few times after making changes. The board survives every refresh.

### Step 4: Break it on purpose

You can't trust error handling you haven't seen run. Try each of these in DevTools, refreshing after each:

1. Delete the key entirely. You should get the seed board.
2. Change the value to `{oops`. You should get the seed board, plus a console warning about invalid JSON.
3. Change the value to valid JSON with the wrong shape, like `{"board": 5}`. Seed board, plus a warning.
4. Remove one task from `tasks` but leave its id in a column. Seed board (or, if you prefer, a repaired board with that id dropped).

Check it: none of the four shows a blank page or an uncaught error.

### Step 5: Don't confuse "empty" with "missing"

A user who deletes every task has an empty board, and that's a valid board. If your loader treats "no tasks" as "no saved data", that user refreshes and the sample tasks they deleted come back. Seed data is only for when `getItem` returns `null` or the data is unusable.

Check it: delete every task, refresh, and the board is still empty.

### Step 6: Plan for the next version

You don't need a migration yet, but decide what happens when you do. The simplest policy: on load, if `devboard-v2` is missing but `devboard-v1` exists, read the old data, convert it to the new shape with a small `migrateV1toV2` function, save it under the new key and delete the old one. Write this plan down in a comment next to `STORAGE_KEY`.

Check it: your comment says, in two sentences, what happens to a v1 user when you ship v2.

## Common mistakes

- **Saving from each handler.** Symptom: some actions survive a refresh and others don't, depending on whether you remembered the save call. Fix: save in `update` and nowhere else.
- **No `try...catch` around `JSON.parse`.** Symptom: one bad value in storage and the app shows a blank page with `SyntaxError: Unexpected token` in the console, on every visit, forever. Fix: catch it and fall back to seed data.
- **Seeding when the board is empty.** Symptom: deleted tasks reappear after a refresh. Fix: only fall back when the key is missing or invalid.
- **Storing objects without stringifying.** Symptom: the saved value is the text `[object Object]`, and loading fails. Fix: `localStorage` stores strings only; always `JSON.stringify` on save.
- **Restoring an open editor.** Symptom: after a refresh, a card is stuck halfway in edit mode with nothing focused. Fix: reset `view.editingId` to `null` when you load.

## Say it in the interview

"Persistence is one line in my `update` function: after every change I serialize the whole state to `localStorage`. On load I parse it inside a `try`, validate the shape, and fall back to seed data if anything's wrong, so corrupt storage can never break the app. The key is versioned, `devboard-v1`, so a future shape change gets a migration instead of a crash. The tradeoff is that I rewrite the whole state on every change rather than just what changed. At this size that's tiny, and it means saving can never miss a field."

## Stretch goals

- Sync open tabs: listen for the `storage` event, which fires in other tabs when one tab writes, and reload state from it.
- Add Export and Import buttons that download the state as a `.json` file and load one back, running it through the same `isValidState` check.
