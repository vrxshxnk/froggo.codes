---
id: lc-79
title: Word Search
pattern: Grid DFS with backtracking
timeBox: 25
summary: Decide whether a word can be traced on a letter grid by moving between side-by-side cells, without using any cell twice.
hints:
  - "Try every cell as the starting point. From a start, the question 'can I spell the rest of the word from here?' is the same question again, one letter shorter."
  - "A path may not reuse a cell, so you need to remember which cells the current path has stepped on. But a different path is allowed to use those cells later."
  - "Write dfs(r, c, k): fail if the cell doesn't match word[k]; succeed if k is the last index. Otherwise overwrite the cell with '#', try the 4 neighbours with k + 1, then put the letter back before returning."
insight: It's backtracking on a grid. Each step chooses a neighbouring cell, and 'visited' belongs to the current path only. So mark the cell on the way in and restore it on the way out.
time: O(m · n · 3^L)
space: O(L)
related: [lc-200, lc-46, lc-212]
---

## The problem in plain English

You get an `m × n` grid `board` of letters and a string `word`. Can you spell `word` by starting at some cell and repeatedly stepping to a cell directly **up, down, left or right** (not diagonal)? Each cell can be used **at most once** in the path. Return `true` or `false`.

Limits: the grid is at most 6 × 6, and the word is at most 15 letters. Letters are upper and lower case English.

Example, with this board:

```text
A B C E
S F C S
A D E E
```

- `"ABCCED"` → `true`: A(0,0) → B(0,1) → C(0,2) → C(1,2) → E(2,2) → D(2,1).
- `"SEE"` → `true`: S(1,3) → E(2,3) → E(2,2).
- `"ABCB"` → `false`: after A B C, the only B next to that C is the one already used.

## Start with brute force

List every simple path in the grid (every path that doesn't repeat a cell), read off its letters, and compare with `word`. On a 6 × 6 grid the number of such paths is astronomically large. Most of them are useless: if the first letter is wrong, nothing that extends the path can help.

The improvement is to build paths one letter at a time and **abandon a path the moment a letter doesn't match.** That's backtracking, and it's what the optimal solution does.

## Building the intuition

Say you're standing on a cell and you've matched the first `k` letters. What do you need now? A neighbouring cell holding `word[k]` that you haven't used yet. If there is one, step on it and ask the same question for `word[k + 1]`. That's the same problem again, one letter shorter, so it's recursion.

So the recursive function is `dfs(r, c, k)`: "can I spell `word[k:]` starting at cell `(r, c)`?"

- If `board[r][c] != word[k]`: no.
- If `k` is the last index: yes, the whole word is matched.
- Otherwise: yes, if any of the 4 neighbours can spell `word[k + 1:]`.

Now the "no reuse" rule. You need to know which cells the **current path** has stepped on. The important word is *current*. Look at this board with the word `"ABCESEEEFS"`:

```text
A B C E
S F E S
A D E E
```

The search may first wander through some E cells on a path that fails. A *different* path, tried later, needs those same E cells. If you left them marked as used, you can wrongly return `false`. The answer here is `true`, but a version that never unmarks, trying directions in the order used below, returns `false`. So "visited" can't be a permanent set like in *Number of Islands*. It must be undone when you leave a cell.

That's the choose / explore / un-choose template from *Subsets*, laid on a grid:

- **Choose:** mark `(r, c)` as visited.
- **Explore:** try the 4 neighbours.
- **Un-choose:** unmark `(r, c)`.

The cheapest way to mark a cell is to overwrite it with a character that can never match, like `'#'`, and write the real letter back afterwards. No extra set is needed.

## The optimal approach

1. For every cell `(r, c)`, if `dfs(r, c, 0)` is true, return `true`.
2. `dfs(r, c, k)`:
   - If `board[r][c] != word[k]`, return `false`. A `'#'` cell never matches, so this also blocks reuse.
   - If `k == len(word) − 1`, return `true`.
   - Save the letter, set `board[r][c] = '#'`.
   - For each of the 4 directions, if the neighbour is inside the grid and `dfs(neighbour, k + 1)` is true, stop: `found = true`.
   - Put the saved letter back, and return `found`.
3. If no start works, return `false`.

**The subtle detail: restore the cell on every exit, including success.** If you `return true` straight from inside the loop, the board is left with `'#'` in it. The answer is still right, but you've silently damaged the caller's input. Setting `found` and restoring once at the end keeps the board unchanged.

{{code}}

## Dry run

The example board, `word = "ABCCED"`. The directions are tried in the order down, up, right, left. Cells are written as (row, col).

| Call | Cell letter | Needs | Result |
|---|---|---|---|
| `dfs(0,0,0)` | A | A | match, mark `#`; try down |
| `dfs(1,0,1)` | S | B | no |
| *(up is off the grid)* | | | try right |
| `dfs(0,1,1)` | B | B | match, mark; down is F |
| `dfs(1,1,2)` | F | C | no; up is off the grid; try right |
| `dfs(0,2,2)` | C | C | match, mark; try down |
| `dfs(1,2,3)` | C | C | match, mark; try down |
| `dfs(2,2,4)` | E | E | match, mark; down is off; up is `#`; right is E, needs D: no; try left |
| `dfs(2,1,5)` | D | D | match, last letter → **true** |

Each call returns `true` back up the chain. On the way, each one writes its letter back, so the board ends exactly as it began.

## Complexity

Let `L` be the length of the word.

- **Time: O(m · n · 3^L).** There are `m · n` starting cells. From each, the first step has 4 directions. Every later step has at most 3, because the cell you came from is marked. That's at most 4 · 3^(L−1) paths per start.
- **Space: O(L)** for the recursion depth. Marking in place needs no visited set.

## Edge cases and traps

- **A visited set that's never cleared.** It's correct on the easy examples and wrong on boards where two paths share cells. Always unmark on the way out.
- **Checking bounds after indexing.** Check `0 <= nr < rows` first, then read `board[nr][nc]`.
- **Returning before restoring.** It leaves `'#'` in the board. Restore on every path out.
- **A word longer than the board.** If `len(word) > m · n`, the answer is `false` at once. That's worth checking up front.
- **A single cell.** `[["a"]]` with `"a"` must return `true`. The "last index" check runs before any neighbour is tried, so it does.

## Say it in the interview

> "I'll try every cell as a start and run a DFS that matches one letter per step. dfs(r, c, k) fails if the cell isn't word[k], and succeeds if k is the last index. Otherwise I mark the cell with a sentinel so this path can't reuse it, try the four neighbours with k + 1, and then restore the letter. Visited has to be per path, because a cell used by a failed path may be needed by another one. That's O(m·n·3^L) time, since each step after the first has at most three new directions, and O(L) space for the recursion."

## Follow-ups interviewers ask

- **"How would you prune further?"** Count letters first. If the board has fewer of some letter than the word needs, return `false` straight away. Also, if the word's last letter is rarer on the board than its first, search for the reversed word, so dead ends happen sooner.
- **"What if you have many words to find?"** That's *Word Search II* in the Tries bonus stage. Put all the words in a trie and run a single DFS from each cell, walking down the trie as you go.
- **"Can you avoid modifying the input?"** Use a separate `visited` boolean grid with the same mark and unmark steps. It costs O(m · n) extra space.
