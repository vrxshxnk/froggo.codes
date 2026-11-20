---
id: lc-200
title: Number of Islands
pattern: Grid flood fill (BFS)
timeBox: 25
summary: Count how many separate islands of land there are in a grid of land and water cells.
hints:
  - "Scan the grid. The first time you step on a piece of land, you've found a new island. The hard part is not counting the same island again later."
  - "When you find new land, visit every land cell connected to it (up, down, left, right) and mark them all as seen. That's called a flood fill."
  - "Loop over every cell. On a '1': add 1 to the count, set it to '0', put it in a queue, and run BFS that turns every connected '1' into '0'. Mark a cell when you push it, not when you pop it."
insight: An island is a connected group of land cells. Scan the grid, and each time you hit land that hasn't been visited, count one island and flood-fill all of it, so its other cells never start a new count.
time: O(m · n)
space: O(m · n)
related: [lc-695, lc-994, lc-417, lc-547]
---

## The problem in plain English

You get an `m × n` grid of characters: `'1'` is land, `'0'` is water. An **island** is a group of land cells joined **horizontally or vertically** (diagonals don't count). Everything outside the grid is water. Return the number of islands.

Limits: up to 300 × 300, so 90,000 cells.

Example:

```text
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1
```

The answer is `3`: the 2 × 2 block at the top left, the single `1` in the middle, and the pair at the bottom right.

## Start with brute force

A naive idea: count every land cell, then try to subtract the ones that "belong" to an island you've already counted. But to know whether two land cells belong to the same island, you have to search for a path between them. Doing that for every pair of land cells is O((m·n)²) searches. For a 300 × 300 grid that's around 8 × 10⁹ pairs, far too slow.

The fix is to explore each island **once**, all of it at the same time, the first moment you touch it.

## Building the intuition

Imagine you're flying over a map with a bucket of paint. You scan it row by row. Whenever you see unpainted land, you say "new island!" and pour paint on it. The paint spreads to every land cell it can reach by moving up, down, left or right. It stops at water. When you continue scanning, every cell of that island is already painted, so you skip it.

The number of times you said "new island!" is the answer.

That paint spreading is called a **flood fill**. In code it's either:

- **BFS** (breadth-first search): keep a queue. Pop a cell, push its unvisited land neighbours. The paint spreads outward in rings.
- **DFS** (depth-first search): recurse into one neighbour as deep as you can before trying the next.

Both visit exactly the same cells. Here we use BFS, because recursion on a 300 × 300 island could go 90,000 calls deep. That crashes Python's default recursion limit of 1000 and can overflow the stack in other languages too.

"Painting" a cell just means marking it visited. The simplest way is to overwrite `'1'` with `'0'`: once a cell is water, nothing will ever count or enqueue it again. (If you're not allowed to change the input, use a separate `visited` grid.)

To find the neighbours of `(r, c)`, loop over a **direction array**: `(1, 0), (−1, 0), (0, 1), (0, −1)`. Add each pair to `(r, c)`, and skip results that fall outside the grid. This saves you from writing four nearly identical `if` blocks.

## The optimal approach

1. `islands = 0`.
2. For every cell `(r, c)`, in row order:
   - If it's not `'1'`, skip it.
   - Otherwise `islands += 1`. Set it to `'0'` and push it onto a queue.
   - While the queue isn't empty: pop a cell. For each of the 4 directions, if the neighbour is inside the grid and is `'1'`, set it to `'0'` and push it.
3. Return `islands`.

**The subtle detail: mark a cell when you push it, not when you pop it.** If you only mark on pop, a cell can be pushed several times before it's popped, once by each neighbour that sees it while it's still `'1'`. The answer stays right, but the queue can grow far larger than the grid, and the run gets much slower. Marking on push guarantees each cell enters the queue at most once.

{{code}}

## Dry run

The example grid. Scanning starts at `(0, 0)`, which is land, so `islands = 1`. The BFS goes like this (directions: down, up, right, left):

| Pop | Neighbours that are `'1'` | Sunk and pushed | Queue after |
|---|---|---|---|
| (start) | | (0,0) | `[(0,0)]` |
| (0,0) | down (1,0), right (0,1) | (1,0), (0,1) | `[(1,0), (0,1)]` |
| (1,0) | right (1,1) | (1,1) | `[(0,1), (1,1)]` |
| (0,1) | none: (1,1) is already `'0'` | | `[(1,1)]` |
| (1,1) | none | | `[]` |

The top-left island is now all water. Scanning continues. Cells (0,1), (1,0) and (1,1) are skipped because they're `'0'`. At `(2, 2)` we find land: `islands = 2`, and its BFS sinks just that cell. At `(3, 3)`: `islands = 3`, and its BFS sinks (3,3) and (3,4). Then the scan reaches (3,4), already `'0'`. Answer: **3**.

## Complexity

- **Time: O(m · n).** The outer scan touches every cell once. Each land cell is pushed and popped at most once, and each pop checks 4 neighbours.
- **Space: O(m · n)** in the worst case, for the BFS queue. On most grids the queue only holds the current "ring" of the flood, which is far smaller, but a maze-shaped island can make that ring large, so O(m · n) is the honest bound. A recursive DFS also needs O(m · n) in the worst case, as call stack: think of one long snake-shaped island.

## Edge cases and traps

- **Characters, not numbers.** The grid holds `'1'` and `'0'` characters. `grid[r][c] == 1` is always false in Python, Java and JavaScript.
- **Marking on pop.** It's correct but can blow up the queue. Mark on push.
- **Counting diagonals.** Only 4 directions. `[[1,0],[0,1]]` has 2 islands, not 1.
- **Deep recursion.** A recursive DFS on a 300 × 300 all-land grid is 90,000 calls deep. Use BFS or an explicit stack, or raise the recursion limit.
- **All water or all land.** The answers are 0 and 1. Nothing special is needed.

## Say it in the interview

> "I'll scan every cell. When I hit a '1' that hasn't been visited, that's a new island, so I increment the count and flood-fill it: BFS over its four neighbours, marking each land cell as water when I push it so nothing is queued twice. After the flood, none of that island's cells can start a new count. Every cell is visited a constant number of times, so it's O(m·n) time. I'm using BFS instead of recursion so a huge island can't overflow the stack. I'm modifying the grid to mark visits; if that's not allowed, I'll keep a separate visited array."

## Follow-ups interviewers ask

- **"Can you do it with Union-Find?"** Yes. Make every land cell its own set, union each land cell with its land neighbours to the right and below, and count the remaining roots. It's the same O(m · n) here, but it shines when land is *added over time* (LeetCode's *Number of Islands II*), as you'll see in the Union-Find bonus stage.
- **"What if the grid is too big for memory?"** Process it row by row and keep only the previous row's labels, merging with Union-Find as rows arrive.
- **"What if diagonals connect too?"** Use an 8-entry direction array. Nothing else changes.
