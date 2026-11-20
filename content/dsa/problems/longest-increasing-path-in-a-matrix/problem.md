---
id: lc-329
title: Longest Increasing Path in a Matrix
pattern: Grid DFS with memoisation
timeBox: 40
summary: Find the length of the longest path in a grid that moves up, down, left or right and strictly increases at every step.
hints:
  - "Try a DFS from every cell, moving only to bigger neighbours. Notice you never need a visited set. Why can't a strictly increasing path ever come back to a cell?"
  - "The longest increasing path starting at a cell depends only on that cell, not on how you got there. So the same cell gets recomputed again and again from different starts."
  - "Memoise: memo[r][c] = 1 + max(memo of each strictly bigger neighbour). Compute it with DFS the first time you need it, and reuse it after that. The answer is the max over all cells."
insight: Because each step must strictly increase, paths can never cycle, so "longest path starting at (r, c)" is a fixed number that doesn't depend on how you arrived. Cache it, and a DFS from every cell costs O(R·C) total.
time: O(R·C)
space: O(R·C)
related: [lc-417, lc-300, lc-200, lc-79]
---

## The problem in plain English

You get an `R × C` grid of integers. From any cell you can move **up, down, left or right** (no diagonals, no wrapping around the edges). Find the length of the longest path where every step goes to a **strictly larger** value. Length counts cells, so a single cell is a path of length 1.

The grid is up to 200 × 200, and values run from 0 to 2³¹ − 1.

Example:

```text
9 9 4
6 6 8
2 1 1
```

→ `4`, via the path `1 → 2 → 6 → 9` (bottom-middle, bottom-left, middle-left, top-left).

## Start with brute force

From every cell, run a DFS that tries all four directions and only steps to bigger values. Return the longest path found.

It's correct, but the same sub-paths get explored again and again. On a grid where values increase in a snake shape, the DFS from the smallest cell walks the whole grid, the DFS from the second-smallest walks almost all of it, and so on. On a 200 × 200 grid that's about 4 × 10⁴ starts, each walking up to 4 × 10⁴ cells: around 10⁹ steps. In general grids, branching makes it exponential.

## Building the intuition

This Hard is two Medium ideas stacked together: **grid DFS** (*Number of Islands*, *Pacific Atlantic Water Flow*) and **memoisation** (the Dynamic Programming stage). The interesting part is seeing *why* memoisation is allowed here, when it usually isn't for grid path problems.

**Step 1: why no visited set?** In *Word Search*, you needed a visited mark, because a path could loop back onto itself. Here every step goes strictly up. If you went `a → b → … → a`, you'd need `a < a`. Impossible. So **increasing paths can never revisit a cell.** The "grid with moves to bigger neighbours" is a **DAG**, a directed acyclic graph.

**Step 2: the answer at a cell doesn't depend on the past.** In *Word Search*, "how far can I go from here?" depended on which cells you'd already used. That made it impossible to cache. Here, because a path can never come back, the history doesn't matter. The longest increasing path **starting at `(r, c)`** is one fixed number. Call it `memo[r][c]`.

**Step 3: write the recurrence.**

```text
memo[r][c] = 1 + max(memo[nr][nc] for each neighbour with matrix[nr][nc] > matrix[r][c])
```

or just `1` if no neighbour is bigger. That's a DP on a DAG. You don't need to figure out an order to fill it in. DFS with a cache computes each cell the first time it's needed, and only then.

**Step 4: why it's fast now.** Each cell is computed once, and each computation looks at 4 neighbours. Every later visit is an O(1) lookup. That's O(R·C) total, however many starting points you try.

## The optimal approach

1. Make `memo` an `R × C` table of zeros (0 = "not computed yet", since every real answer is at least 1).
2. `dfs(r, c)`:
   - if `memo[r][c]` is set, return it;
   - `best = 1`;
   - for each of the 4 neighbours inside the grid with a **strictly greater** value, `best = max(best, 1 + dfs(neighbour))`;
   - store `memo[r][c] = best` and return it.
3. Return the max of `dfs(r, c)` over every cell.

**The subtle detail: strictly greater.** With `>=`, equal neighbours could step back and forth forever. That's a cycle, and the recursion never ends. Strictly greater is what makes the graph acyclic and the cache valid.

{{code}}

## Dry run

The example grid. We call `dfs` in row-major order. Each row shows the memo value once it's set.

| Call | Cell (value) | Bigger neighbours | memo set to |
|---|---|---|---|
| dfs(0,0) | 9 | none | 1 |
| dfs(0,1) | 9 | none | 1 |
| dfs(0,2) | 4 | (0,1)=9 → 1, (1,2)=8 → dfs = 1 | 2 |
| (inside the call above) dfs(1,2) | 8 | none | 1 |
| dfs(1,0) | 6 | (0,0)=9 → 1 | 2 |
| dfs(1,1) | 6 | (0,1)=9 → 1, (1,2)=8 → 1 | 2 |
| dfs(2,0) | 2 | (1,0)=6 → 2 | 3 |
| dfs(2,1) | 1 | (1,1)=6 → 2, (2,0)=2 → 3 | **4** |
| dfs(2,2) | 1 | (1,2)=8 → 1 | 2 |

The final memo table:

```text
1 1 2
2 2 1
3 4 2
```

The maximum is `4`, at `(2, 1)`. Notice `dfs(2,1)` didn't re-explore anything. It read `memo[2][0] = 3` and `memo[1][1] = 2`, which were already known.

## Complexity

- **Time: O(R·C).** Each cell is computed once with 4 neighbour checks. Every other call returns from the cache in O(1).
- **Space: O(R·C)** for the memo table, plus the recursion stack, which can also reach O(R·C) on a snake-shaped grid (one long increasing path).

## Edge cases and traps

- **Using a visited set.** It isn't needed, and it's actively wrong if you keep it across starts. A cell already visited from another start isn't "blocked". Its memo value is exactly what you want to reuse.
- **`>=` instead of `>`.** Equal neighbours create cycles, and the recursion never ends. `[[7, 7], [7, 7]]` → 1.
- **Memoising the wrong direction.** `memo` must mean "longest path **starting** here, going up". If you mix in "ending here", the recurrence breaks.
- **Recursion depth.** A 200 × 200 snake gives depth 4 × 10⁴. That's fine on LeetCode for C++, Java and JavaScript. In Python, LeetCode's limit is high enough, but in your own scripts call `sys.setrecursionlimit`. Or use the iterative version below.
- **Large values.** Values go up to 2³¹ − 1. You only compare them and never add them, so there's no overflow risk.

## Say it in the interview

> "A DFS from every cell that only steps to bigger neighbours finds the answer, but it repeats work. Because every step strictly increases, a path can never revisit a cell. So the longest path starting at a cell is a fixed value, independent of how I got there. I cache it: memo of a cell is 1 plus the max memo over its strictly bigger neighbours. With the cache, each cell is computed once with four checks, so O(R·C) time and O(R·C) space."

## Follow-ups interviewers ask

- **"Do it without recursion."** Use topological order. Count, for each cell, how many neighbours are *smaller* (its in-degree). Start a BFS from cells with in-degree 0 (local minima) and peel off layer by layer. The number of layers is the answer. Sorting all cells by value and relaxing in that order also works, in O(R·C log(R·C)).
- **"Return the path itself."** Store which neighbour gave the best value for each cell. Then follow those pointers from the cell with the biggest memo.
- **"Allow diagonal moves too."** Add the 4 diagonal directions to `dirs`. Steps still strictly increase, so the graph is still acyclic and the same memo works. That's O(8·R·C), which is still O(R·C).
