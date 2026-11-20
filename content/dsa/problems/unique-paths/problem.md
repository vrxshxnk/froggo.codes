---
id: lc-62
title: Unique Paths
pattern: 2D grid DP
timeBox: 25
summary: Count the different routes from the top-left to the bottom-right corner of a grid when you may only move right or down.
hints:
  - "Think about the very last move into the bottom-right cell. Where could you have been just before it?"
  - "You arrived from the cell above or the cell to the left, and those two groups of routes never overlap. So paths(cell) = paths(above) + paths(left)."
  - "Let dp[r][c] be the number of routes to cell (r, c). Every cell in the top row and left column has exactly 1 route. Fill the rest row by row and return the bottom-right cell."
insight: Every route into a cell arrives from above or from the left, so the number of routes to a cell is the sum of the routes to those two neighbours. Fill the grid from the top-left corner outwards.
time: O(m · n)
space: O(m · n)
related: [lc-70, lc-1143, lc-72]
---

## The problem in plain English

A robot sits in the top-left cell of a grid with `m` rows and `n` columns. Each move, it steps **one cell right or one cell down**, never left or up. Return how many **different routes** take it to the bottom-right cell.

`m` and `n` are between 1 and 100, and the answer is guaranteed to fit in a 32-bit integer (at most 2 × 10⁹).

Example: `m = 3`, `n = 2` → `3`. The routes are right-down-down, down-right-down and down-down-right.

## Start with brute force

Walk every route recursively: from each cell, try going right and try going down, and count the routes that reach the corner.

```python
def paths(r, c):
    if r == m - 1 and c == n - 1: return 1
    if r >= m or c >= n: return 0
    return paths(r + 1, c) + paths(r, c + 1)
```

It's correct, but it visits every route one by one. A 100 × 100 grid has more than 10⁵⁷ routes. Even an 18 × 18 grid has over 2 billion.

## Building the intuition

The recursion keeps arriving at the same cells. Cell (1, 1) is reached by right-then-down and by down-then-right, and each time the recursion recounts every route from (1, 1) onwards. The grid only has `m · n` cells, so there are only `m · n` different questions.

This is *Climbing Stairs* on a grid. On the stairs, step `i` was reached from `i − 1` or `i − 2`. Here, a cell is reached from **above** or from the **left**. Walk through the recipe:

1. **State.** `dp[r][c]` means *the number of different routes from the top-left cell to cell `(r, c)`*.
2. **Recurrence.** The last move into `(r, c)` was a down-move from `(r − 1, c)` or a right-move from `(r, c − 1)`. Every route falls into exactly one of those groups. So `dp[r][c] = dp[r − 1][c] + dp[r][c − 1]`.
3. **Base cases.** Every cell in the top row can only be reached by moving right the whole way: 1 route. Every cell in the left column: only down, 1 route. That includes the start, `dp[0][0] = 1`.
4. **Order.** Each cell reads the cell above and the cell to the left. Row by row, left to right, both are ready.

## The optimal approach

1. Make an `m × n` table filled with 1. That sets the top row and left column at once.
2. For `r` from 1 to `m − 1`, for `c` from 1 to `n − 1`: `dp[r][c] = dp[r − 1][c] + dp[r][c − 1]`.
3. Return `dp[m − 1][n − 1]`.

**The subtle detail: why the edges are 1, not 0.** It's tempting to say "the top row has nothing above it, so add 0 from above". That's the same thing, as long as you start with `dp[0][0] = 1`. Filling the edges with 1 directly avoids special cases inside the loop.

**Space optimisation.** Row `r` only reads row `r − 1`. In fact one row is enough: keep `row` of length `n`, all 1s, and for each new row do `row[c] += row[c − 1]` from left to right. Before the update, `row[c]` still holds the value from above; `row[c − 1]` was just updated and holds the value from the left. Space drops to O(n).

```python
row = [1] * n
for r in range(1, m):
    for c in range(1, n):
        row[c] += row[c - 1]   # above (old row[c]) + left (new row[c-1])
return row[-1]
```

{{code}}

## Dry run

`m = 3`, `n = 7`. Row 0 and column 0 are the base cases (all 1). Every other cell is the one above plus the one to the left.

| r \ c | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| **0** | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| **1** | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| **2** | 1 | 3 | 6 | 10 | 15 | 21 | **28** |

A few cells worked out:

| Cell | above + left | Value |
|---|---|---|
| `dp[1][1]` | `dp[0][1] + dp[1][0] = 1 + 1` | 2 |
| `dp[1][6]` | `dp[0][6] + dp[1][5] = 1 + 6` | 7 |
| `dp[2][3]` | `dp[1][3] + dp[2][2] = 4 + 6` | 10 |
| `dp[2][6]` | `dp[1][6] + dp[2][5] = 7 + 21` | **28** |

The answer is 28.

## Complexity

- **Time: O(m · n).** One addition per cell: at most 10,000 for a 100 × 100 grid.
- **Space: O(m · n)** for the table, or **O(n)** with the single-row version.

## Edge cases and traps

- **A single row or column.** `m = 1` or `n = 1` → 1 route. The loops don't run and the table is all 1s.
- **`m = n = 1`.** Already at the goal: 1 route (doing nothing), not 0.
- **Initialising everything to 0.** Then nothing ever becomes non-zero. The edges must be 1.
- **Mixing up rows and columns.** The table is `m` rows by `n` columns; `dp[m − 1][n − 1]` is the corner. Swapping them gives the same number here, but it will bite you on *Unique Paths II*, where obstacles break the symmetry.

## Say it in the interview

> "Let `dp[r][c]` be the number of routes to cell `(r, c)`. The last move came from above or from the left, so `dp[r][c] = dp[r − 1][c] + dp[r][c − 1]`. The top row and left column are all 1. I fill row by row in O(m·n) time. Since each row only needs the previous one, a single array with `row[c] += row[c − 1]` gives O(n) space. There's also a formula: choose which `m − 1` of the `m + n − 2` moves go down."

## Follow-ups interviewers ask

- **"Is there a closed form?"** Yes. Every route is `m − 1` downs and `n − 1` rights in some order, so the answer is C(m + n − 2, m − 1). Compute it with a loop of multiplications and divisions in 64-bit to avoid overflow.
- **"Some cells are blocked."** That's *Unique Paths II*: same recurrence, but a blocked cell is 0, and the edges stop being 1 after the first obstacle.
- **"Minimum cost path instead of counting?"** Same grid and order, with `dp[r][c] = cost[r][c] + min(above, left)`.
