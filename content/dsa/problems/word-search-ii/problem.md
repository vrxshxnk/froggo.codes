---
id: lc-212
title: Word Search II
pattern: Trie-guided grid backtracking
timeBox: 40
summary: Given a letter grid and a list of words, return every word that can be traced through adjacent cells without reusing a cell.
hints:
  - "Running Word Search once per word repeats the same grid exploration thousands of times. Can one walk over the grid check all the words at once?"
  - "Put all the words in a trie. While you DFS from a cell, keep a pointer into the trie: the letters on your current path are a prefix, and if no word has that prefix, stop right there."
  - "DFS(cell, trie node): step only to neighbours whose letter is a child of the current node. Store each whole word at its end node; when you reach one, record it and clear it so it isn't reported twice. Mark cells visited by overwriting them, and restore them on the way back."
insight: Build a trie of all the words and backtrack over the grid with a pointer into it. The trie checks every word at once and kills a path the moment its letters stop being a prefix of any word.
time: "O(m · n · 4 · 3^(L−1)) worst case, L = longest word (at most 10)"
space: O(total letters in words)
related: [lc-79, lc-208, lc-200, lc-211]
---

## The problem in plain English

You get an `m × n` grid `board` of lowercase letters (at most 12 × 12) and a list of distinct `words` (up to 3 × 10⁴ of them, each at most 10 letters long). Return every word that appears in the grid.

A word "appears" if you can spell it by starting at some cell and stepping to a **horizontally or vertically adjacent** cell for each next letter, **never using the same cell twice** in one word. Return the found words in any order.

Example:

```text
o a a n
e t a e
i h k r
i f l v
```

`words = ["oath", "pea", "eat", "rain"]` → `["oath", "eat"]`. "oath" goes o(0,0) → a(0,1) → t(1,1) → h(2,1). "eat" goes e(1,3) → a(1,2) → t(1,1). There's no `p`, so no "pea", and "rain" can't be traced.

## Start with brute force

You already know *Word Search*, from the Backtracking & Graphs stage: given **one** word, DFS from every cell, matching letter by letter, and backtrack.

So run it once per word. Each run starts from up to 144 cells and can branch three ways at each of up to 9 further steps (four directions, minus the one you came from). That's up to 144 × 4 × 3⁹ ≈ 11 million steps **per word**, and there can be 3 × 10⁴ words. Even with typical early exits, words that share prefixes like "oat", "oath" and "oaths" redo the same grid exploration again and again.

## Building the intuition

The waste is that every word walks the grid separately. Two words starting with "oa" both explore every "o → a" path in the grid.

Turn it around. Do **one** backtracking search over the grid, and at every step ask: "Is the path I've spelled so far the beginning of **any** word?" If not, stop. If the path spells a **whole** word, record it.

"Is this the beginning of any word?" is `startsWith`, and a trie answers it. Even better, you don't have to restart the lookup from the root each step. As the DFS adds one letter to its path, the trie pointer moves one child down. So the DFS carries **two positions at once**: a cell in the grid and a node in the trie.

- Step to a neighbour only if its letter is a **child** of the current trie node. That one check is the whole pruning.
- If the trie node marks the end of a word, you've found that word.

The trie also makes shared prefixes free. "oat", "oath" and "oaths" share one path, explored once.

## The optimal approach

1. **Build a trie** of all the words. At each word's last node, store **the word itself** (`node.word = "oath"`) instead of a plain true flag. Then you never have to rebuild the string from the path.
2. **Start a DFS from every cell** whose letter is a child of the root.
3. **`dfs(r, c, parent)`:**
   - Let `ch = board[r][c]` and `node = parent.children[ch]`.
   - If `node.word` is set, add it to the answer and **clear it**, so it can't be added twice.
   - **Mark** the cell visited by setting it to `#`, which is never a trie key, so it can't be stepped on again.
   - For each of the 4 neighbours inside the grid whose letter is in `node.children`, recurse with `node` as the new parent.
   - **Restore** `board[r][c] = ch`.
   - **Prune:** if `node` now has no children and no word, delete it from `parent.children`.
4. Return the collected words.

Three details make this both correct and fast:

- **Clearing `node.word`.** A word can be traced along several paths, or from several starts. Without clearing, it would show up more than once.
- **Marking by overwriting the cell.** There's no separate visited array, and because `#` is never a child, the "is this letter a child?" check skips visited cells for free.
- **Pruning finished branches.** Once every word under a node has been found, that node is useless. Deleting it means later DFS calls don't even step in. On grids full of one repeated letter, this is the difference between passing and timing out.

{{code}}

## Dry run

The example grid, with `words = ["oath", "pea", "eat", "rain"]`. The trie's root has children `o`, `p`, `e` and `r`.

| Step | Cell | Letter | Trie node | What happens |
|---|---|---|---|---|
| 1 | (0,0) | o | `o` | root has `o` → DFS starts here; mark (0,0) |
| 2 | (0,1) | a | `oa` | neighbour `a` is a child of `o` → go |
| 3 | (1,1) | t | `oat` | `t` is a child of `oa` → go. (0,2)'s `a` isn't a child of `oa`, so it's skipped |
| 4 | (2,1) | h | `oath` | `node.word = "oath"` → **record it**, clear it |
| 5 | — | — | — | `oath` has no children and no word left → prune it. As the calls return, `oat`, `oa` and `o` are now empty too, so they're pruned |
| 6 | (0,1), (0,2), … | a, n | — | root has no `a` or `n` → never start there |
| 7 | (1,0) | e | `e` | neighbours `o`, `i` and `t`: none is `a`, the only child of `e` → dead end |
| 8 | (1,3) | e | `e` | neighbour (1,2) `a` → `ea`, then (1,1) `t` → `eat`: **record it** |
| 9 | (2,3) | r | `r` | neighbours `e`, `k`, `v`: none is `a` → dead end |

Answer: `["oath", "eat"]`. Notice step 3: the search never even looked down paths like "oaa", because no word starts that way.

## Complexity

- **Time: O(m · n · 4 · 3^(L−1)) in the worst case**, where L is the longest word (10 here). Each start cell can go 4 ways, then at most 3 ways (you can't go back) at each later step, and the trie stops a path once it leaves every word. Building the trie adds O(total letters in words). In practice, pruning and shared prefixes keep it far below the bound.
- **Space: O(total letters in words)** for the trie, plus O(L) recursion depth. The board is reused for visited marks.

## Edge cases and traps

- **Duplicates in the output.** The same word found twice, along two paths or from two starts. Clear `node.word` when you record it.
- **Stopping at the first word on a path.** Finding "oat" must not end the DFS, because "oath" may continue from there. Record it and keep going.
- **Forgetting to restore the cell.** Then later paths think it's visited, and you miss words.
- **Reusing a cell within one word.** "abcb" on `[[a, b], [c, d]]` would need the `b` cell twice. The `#` mark prevents that.
- **One-cell board.** `[["a"]]` with `["a"]` finds "a" right at the start cell, before any neighbour step.
- **Pruning while iterating the children.** We only delete a child after its own DFS returns, and the loop runs over directions, not over the children map, so nothing is modified mid-iteration.

## Say it in the interview

> "Running Word Search for each word repeats the same grid exploration, so I'll put all the words in a trie and do one backtracking pass. The DFS carries a grid cell and a trie node together. I only step to a neighbour if its letter is a child of the current node, so any path that isn't a prefix of some word dies immediately. Each word is stored at its last trie node. When I reach it, I record it and clear it, so I don't add it twice. I mark cells visited by overwriting them and restore them on the way back, and I prune trie nodes once nothing is left below them. The worst case is m times n times 4 times 3 to the L minus 1, but the trie keeps it far lower in practice."

## Follow-ups interviewers ask

- **"Why is the trie better than Word Search per word?"** Words sharing a prefix share one exploration, and a path stops as soon as it isn't a prefix of *any* word, not just of the current one.
- **"How do you make it faster still?"** Prune found branches (done above). You can also skip words containing a letter the board doesn't have, or that use a letter more often than the board does.
- **"What if diagonal moves are allowed?"** Use 8 directions. The algorithm is unchanged; the branching factor goes up.
