---
id: lc-417
title: Pacific Atlantic Water Flow
pattern: Reverse multi-source BFS
timeBox: 25
summary: On a height map bordered by two oceans, find every cell from which rainwater can flow into both oceans.
hints:
  - "Checking every cell separately means one search per cell. Can you turn the question around and start from the oceans instead?"
  - "Water flows from a cell to a neighbour that is the same height or lower. Running that backwards: from the ocean, you can climb to any neighbour that is the same height or higher."
  - "Run one BFS that starts from every Pacific shore cell at once and climbs uphill, and another from every Atlantic shore cell. The answer is the cells that both searches reached."
insight: Don't ask 'where can this cell's water go?' for each of m·n cells. Ask 'which cells can reach this ocean?' once per ocean, by flooding uphill from the whole shoreline at once. Then intersect the two results.
time: O(m · n)
space: O(m · n)
related: [lc-200, lc-994, lc-695]
---

## The problem in plain English

You get an `m × n` grid `heights`. Each number is the height of a square of land on an island. The **Pacific Ocean** touches the island's **top and left** edges. The **Atlantic Ocean** touches the **bottom and right** edges.

When it rains, water on a cell can flow to a neighbouring cell (up, down, left or right) if that neighbour's height is **less than or equal to** the current one. Water on any edge cell can flow straight into the ocean on that side. Return the coordinates `[r, c]` of every cell whose water can reach **both** oceans, in any order.

Limits: up to 200 × 200, so 40,000 cells.

Example, a 3 × 3 spiral:

```text
          Pacific
        1   2   3
Pacific 8   9   4   Atlantic
        7   6   5
          Atlantic
```

The answer is every cell except `(0,0)` and `(0,1)`, seven cells in all. The top-right `3` touches both oceans directly. The `9` can flow down to the `6` (Atlantic) and up to the `2` (Pacific). But the `2` at `(0,1)` can only flow down to the `1`, and the `1` only borders the Pacific, so it never reaches the Atlantic.

## Start with brute force

For every cell, run a BFS that follows the water **downhill**, and record whether it ever touches a Pacific edge and an Atlantic edge. Each search can visit the whole grid, so that's `m·n` searches of `m·n` cells each. That's O((m·n)²): for a 200 × 200 grid, 40,000 × 40,000 = 1.6 × 10⁹ steps. Too slow.

The waste: neighbouring cells usually drain into the same places, so the searches overlap massively.

## Building the intuition

Flip the question. Instead of "where can this cell's water go?", ask **"which cells can send water to the Pacific?"**

Start at the ocean and walk *backwards* along the water's path. Water flows from a high cell to a lower-or-equal one. So walking backwards, you step from a cell to a neighbour that is **higher or equal**. Starting from the shoreline and climbing uphill, every cell you can reach is a cell whose water can flow down to that shore.

Now the second idea: you don't need one search per shore cell. Put **every** Pacific shore cell (the top row and the left column) in the queue at the start, and run one BFS. This is **multi-source BFS**: a single search that starts from many places at once. It visits each cell at most once in total, no matter how many sources there are.

Do the same for the Atlantic (the bottom row and the right column). Now you have two yes/no grids: `pacific[r][c]` and `atlantic[r][c]`. A cell is in the answer exactly when both are true.

Two searches of O(m·n) each, instead of `m·n` searches. That's the whole trick, and you'll use it again in *Rotting Oranges*.

## The optimal approach

1. Write `reachable(starts)`:
   - `seen` is an `m × n` grid of `False`. Mark every start cell as seen and push it onto a queue.
   - BFS: pop `(r, c)`. For each neighbour `(nr, nc)` inside the grid that isn't seen yet, if `heights[nr][nc] >= heights[r][c]`, mark it and push it.
   - Return `seen`.
2. `pacific = reachable(top row + left column)`.
3. `atlantic = reachable(bottom row + right column)`.
4. Return every `[r, c]` where both are true.

**The subtle detail is the direction of the comparison.** Forward, water goes from `h` to a neighbour with height `<= h`. Since we're walking backwards, we move to a neighbour with height `>= h`. Writing `<=` here is the most common bug, and it quietly computes something else entirely. Also note it's `>=`, not `>`: water flows across flat ground, so equal heights must connect.

{{code}}

## Dry run

The spiral grid. The Atlantic search starts from the bottom row and the right column: queue `[(2,0) 7, (2,1) 6, (2,2) 5, (0,2) 3, (1,2) 4]`. The corner `(2,2)` is in both lists but is queued only once.

| Pop | Height | Neighbours checked | Added |
|---|---|---|---|
| (2,0) | 7 | up (1,0) = 8 ≥ 7 | (1,0) |
| (2,1) | 6 | up (1,1) = 9 ≥ 6 | (1,1) |
| (2,2) | 5 | up and left already seen | |
| (0,2) | 3 | left (0,1) = 2 < 3, can't climb | |
| (1,2) | 4 | all already seen | |
| (1,0) | 8 | up (0,0) = 1 < 8, can't climb | |
| (1,1) | 9 | up (0,1) = 2 < 9, can't climb | |

So `atlantic` is true everywhere except `(0,0)` and `(0,1)`. The Pacific search, starting from the top row and the left column, climbs `2 → 9`, `3 → 4 → 5 → 6`, and reaches all nine cells. The intersection is the seven cells in the answer.

## Complexity

- **Time: O(m · n).** Each BFS visits each cell at most once and checks 4 neighbours. Two searches and one final scan are still O(m · n).
- **Space: O(m · n)** for the two `seen` grids and the queues.

## Edge cases and traps

- **Using `<=` instead of `>=`.** You're walking uphill from the ocean, so the neighbour must be at least as high.
- **Using `>` instead of `>=`.** Flat ground lets water through. On a grid of equal heights, every cell is in the answer.
- **One search per cell.** Correct, but O((m·n)²), which is too slow at 200 × 200.
- **Shore corners.** The top-right and bottom-left corners touch both oceans. Marking a cell seen before pushing it keeps duplicates out of the queue.
- **Recursive DFS in Python.** It works on small grids, but a 200 × 200 grid can recurse 40,000 deep. BFS avoids that.

## Say it in the interview

> "Checking each cell on its own is O((m·n)²). I'll reverse it: from each ocean I flood inland, moving to neighbours that are the same height or higher, because that's water's path run backwards. I start each flood from the whole shoreline at once, as a multi-source BFS, so each one is O(m·n). One search gives the cells that can reach the Pacific, the other the Atlantic, and the answer is the cells in both. O(m·n) time and space."

## Follow-ups interviewers ask

- **"Why not DFS?"** DFS works the same way, starting a DFS from each shore cell and sharing one visited grid. Recursion depth can reach `m · n`, so in Python use BFS or an explicit stack.
- **"What if there were k oceans?"** Run one multi-source search per ocean and keep a count per cell (or a bitmask). It's O(k · m · n).
- **"Which cells reach neither ocean?"** That's the cells that are false in both grids, after the same two searches.
