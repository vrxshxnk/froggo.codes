---
id: lc-695
title: Max Area of Island
pattern: Grid flood fill (DFS)
timeBox: 25
summary: In a grid of land and water, return the number of cells in the largest island, or 0 if there's no land.
hints:
  - "This is Number of Islands, but instead of counting islands you measure each one."
  - "A flood fill visits every cell of an island exactly once. If you add 1 for every cell you visit, you have the island's area."
  - "For every unvisited 1: set area = 0, mark it, push it on a stack. While the stack isn't empty, pop a cell, add 1 to area, and push each land neighbour (marking it as you push). Keep the maximum area."
insight: A flood fill already touches every cell of an island exactly once, so counting the cells as you pop them gives the island's size for free. Take the maximum over all islands.
time: O(m · n)
space: O(m · n)
related: [lc-200, lc-417, lc-994]
---

## The problem in plain English

You get an `m × n` grid of integers: `1` is land, `0` is water. An island is a group of `1`s joined **up, down, left or right** (not diagonally). Its **area** is the number of cells in it. Return the largest area of any island, or `0` if the grid has no land at all.

Limits: up to 50 × 50, so 2,500 cells.

Example:

```text
1 1 0
0 1 1
1 0 0
```

There are two islands. The first is `(0,0), (0,1), (1,1), (1,2)`, which has area 4. The second is just `(2,0)`, with area 1. The answer is `4`.

## Start with brute force

For every land cell, run a fresh search to count everything connected to it, and keep the biggest count. That's correct, but every cell of an island repeats the same search. An all-land 50 × 50 grid runs 2,500 searches of 2,500 cells each: over 6 million steps where 2,500 would do. On bigger grids it's quadratic in the number of cells.

The waste is obvious once you see it: all cells of one island have the same answer. Measure each island once.

## Building the intuition

You already solved *Number of Islands*: scan the grid, and when you find unvisited land, flood-fill it so it's never counted again. That flood fill visits **every cell of the island exactly once**.

So the size of the island is just "how many cells did the flood fill visit?" Keep a counter, add 1 every time you take a cell off the stack, and when the stack is empty, that counter is the area. The only new line of code compared with Number of Islands is `area += 1`, plus a `max`.

This time let's flood with **DFS** instead of BFS, to see that the choice doesn't matter for this kind of problem. The only difference is the container:

| Container | Take from | Search type |
|---|---|---|
| Queue | the front (oldest) | BFS: spreads in rings |
| Stack | the back (newest) | DFS: dives down one path first |

Both visit the same set of cells. Order only matters when you care about distance, which you will in *Rotting Oranges*.

Why an explicit stack and not recursion? A recursive DFS on an all-land 50 × 50 grid can go 2,500 calls deep. Python's default recursion limit is 1000, so that would crash. An explicit stack has no such limit, and it's the same algorithm. (In C++ or Java a recursive version of this size is fine, and many people write it that way.)

## The optimal approach

1. `best = 0`.
2. For every cell `(r, c)`:
   - Skip it unless `grid[r][c] == 1`.
   - `area = 0`. Set the cell to `0` (visited) and push it.
   - While the stack isn't empty: pop a cell, do `area += 1`. For each of the 4 neighbours that's inside the grid and equal to `1`, set it to `0` and push it.
   - `best = max(best, area)`.
3. Return `best`.

**The subtle detail: count on pop, mark on push.** Every cell is pushed exactly once, because it becomes `0` the moment it's pushed. So every cell is popped exactly once too, and counting pops gives the exact area. If you marked on pop instead, the same cell could be pushed by two neighbours, popped twice, and counted twice.

{{code}}

## Dry run

The example grid. Directions are tried in the order down, up, right, left. The scan starts at `(0, 0)`, which is land.

| Pop | `area` | Land neighbours found (marked and pushed) | Stack after |
|---|---|---|---|
| (start) | 0 | (0,0) | `[(0,0)]` |
| (0,0) | 1 | right (0,1) | `[(0,1)]` |
| (0,1) | 2 | down (1,1) | `[(1,1)]` |
| (1,1) | 3 | right (1,2) | `[(1,2)]` |
| (1,2) | 4 | none | `[]` |

`best = 4`. The scan skips the sunk cells until `(2, 0)`, whose flood fill pops only itself: area 1, so `best` stays 4. Answer: **4**.

## Complexity

- **Time: O(m · n).** Each cell is scanned once, pushed at most once and popped at most once, and each pop checks 4 neighbours.
- **Space: O(m · n)** in the worst case, for the stack. On an all-land grid, the stack can hold a large share of the cells at once. Marking in place means no extra visited grid.

## Edge cases and traps

- **No land.** Return `0`, not `-1` and not an error. Starting `best` at 0 handles it.
- **Counting on push and on pop.** Pick one place to count. Here it's the pop.
- **Diagonal neighbours.** `[[1,0],[0,1]]` has two islands of area 1, so the answer is 1, not 2.
- **Recursion depth in Python.** A recursive flood fill can pass 1000 calls on a 50 × 50 grid. Use a stack or call `sys.setrecursionlimit`.
- **Changing the input.** We turn land into water as we go. If the caller needs the grid afterwards, copy it first or use a separate `visited` array.

## Say it in the interview

> "This is Number of Islands where I measure each island instead of counting them. I scan the grid. On each unvisited land cell I start a flood fill with an explicit stack, marking cells as water when I push them so each one is pushed once. I add one to the area every time I pop, so when the stack empties I have that island's exact size. I keep the maximum. Every cell is handled a constant number of times, so it's O(m·n) time, and O(m·n) worst-case space for the stack. I used a stack instead of recursion so a big island can't hit the recursion limit."

## Follow-ups interviewers ask

- **"What if you may flip one water cell to land?"** That's *Making A Large Island*. Label each island with an id and store its area. Then for each water cell, add up the areas of the *distinct* island ids around it, plus 1.
- **"Return the island's cells, not just its size."** Collect the popped cells in a list during the flood fill and keep the list for the best island.
- **"Can you solve it with Union-Find?"** Yes. Union neighbouring land cells and track each root's size. The answer is the largest size. It's the same O(m · n) here, but it works when land arrives one cell at a time.
