---
id: lc-994
title: Rotting Oranges
pattern: Multi-source BFS by levels
timeBox: 25
summary: Rot spreads from rotten oranges to neighbouring fresh ones every minute; return how many minutes until no fresh orange is left, or -1 if some never rot.
hints:
  - "Rot spreads like ripples in a pond, one step per minute. Which search spreads outward one step at a time?"
  - "All the rotten oranges start spreading at the same moment. So don't run one BFS per rotten orange. Put all of them in the queue at minute 0 and run a single BFS."
  - "Count the fresh oranges first. Process the queue one level at a time (everything currently in it is one minute). Rot each fresh neighbour, push it, and decrease the fresh count. At the end, return the minutes if fresh is 0, else -1."
insight: The rot is a BFS that starts from every rotten orange at once. Each BFS level is one minute, so the number of levels is the answer. A fresh-orange counter tells you whether any were never reached.
time: O(m · n)
space: O(m · n)
related: [lc-200, lc-417, lc-207, lc-127]
---

## The problem in plain English

You get an `m × n` grid. Each cell is:

- `0`: empty,
- `1`: a fresh orange,
- `2`: a rotten orange.

Every minute, every fresh orange that is directly up, down, left or right of a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains. If some fresh orange can never rot, return `-1`. If there are no fresh oranges to begin with, the answer is `0`.

Limits: the grid is at most 10 × 10.

Example:

```text
2 1 1
1 1 0
0 1 1
```

The answer is `4`. The rot spreads one ring per minute from the top-left corner and reaches the bottom-right orange last.

## Start with brute force

Simulate it literally. Each minute, scan the whole grid and find every fresh orange next to a rotten one. Rot them all at once (collect them first, so an orange that rots this minute doesn't spread rot in the same minute). Stop when a minute changes nothing.

Each minute costs O(m·n), and the process can last up to O(m·n) minutes (picture a long snake of oranges). That's O((m·n)²). On a 10 × 10 grid it's fine. But it rescans thousands of cells that can't change. The optimal version only looks at the oranges that just rotted.

## Building the intuition

Watch the example. At minute 0 only the corner is rotten. At minute 1 its neighbours rot. At minute 2 *their* neighbours rot. The rot moves outward one step per minute, like ripples in a pond.

"Spreads outward one step at a time" is exactly how **BFS** works. BFS visits everything at distance 1 first, then everything at distance 2, and so on. The minute an orange rots is just its distance from the nearest rotten orange.

What if there are several rotten oranges at the start? They all spread *at the same time*. If you ran one BFS per rotten orange, you'd have to merge the results and take, for each orange, the earliest time. That's messy and slow.

The clean answer is **multi-source BFS**: put *all* the starting rotten oranges in the queue at minute 0, then run one ordinary BFS. The queue naturally holds the minute-0 oranges, then all the minute-1 oranges, then minute 2, and so on. It's like dropping several stones into the pond at once.

Two more pieces:

- **Counting minutes.** Process the queue **level by level**. Read the queue's size, pop exactly that many oranges (they all rotted in the same minute), push their fresh neighbours, then add 1 to the minute count.
- **Detecting -1.** Count the fresh oranges before you start. Subtract 1 each time one rots. If the count is still above 0 when the BFS ends, some orange was walled off by empty cells.

## The optimal approach

1. Scan the grid once. Push every `2` onto the queue, and count every `1` into `fresh`.
2. `minutes = 0`. While the queue isn't empty **and** `fresh > 0`:
   - Let `size` be the queue's current length. Pop `size` cells.
   - For each popped cell, for each of the 4 neighbours that's inside the grid and equal to `1`: set it to `2`, do `fresh -= 1`, and push it.
   - `minutes += 1`.
3. Return `minutes` if `fresh == 0`, else `-1`.

**The subtle detail is the `fresh > 0` condition on the loop.** Without it, the last level of oranges is popped, finds nothing new, and still adds 1 to `minutes`. You'd return 5 instead of 4 on the example. Stopping as soon as nothing fresh is left avoids that off-by-one, and it also makes "no fresh oranges at all" return 0 without a special case.

{{code}}

## Dry run

The example grid. Fresh oranges at the start: 6. The queue holds `(0,0)`.

| Minute | Popped this level | Newly rotten | `fresh` after |
|---|---|---|---|
| 1 | (0,0) | (1,0), (0,1) | 4 |
| 2 | (1,0), (0,1) | (1,1), (0,2) | 2 |
| 3 | (1,1), (0,2) | (2,1) | 1 |
| 4 | (2,1) | (2,2) | 0 |

Now `fresh == 0`, so the loop stops with `minutes = 4`. The queue still holds `(2,2)`, but it doesn't matter: nothing is left to rot.

For `[[2,1,1],[0,1,1],[1,0,1]]`, the orange at `(2,0)` has an empty cell above it and an empty cell to its right. The BFS ends with `fresh = 1`, so the answer is **-1**.

## Complexity

- **Time: O(m · n).** One scan to fill the queue, then each orange is pushed and popped at most once, with 4 neighbour checks each.
- **Space: O(m · n)** for the queue in the worst case. The grid itself stores the rotten state, so no visited array is needed.

## Edge cases and traps

- **No fresh oranges.** `[[0, 2]]` or `[[0]]` must return `0`. The loop never runs, because `fresh` is 0.
- **Fresh oranges but nothing rotten.** `[[1]]` returns `-1`. The queue starts empty and `fresh` stays at 1.
- **The extra minute at the end.** Counting a level that rots nothing gives an answer that's one too big. Guard the loop with `fresh > 0`.
- **Rotting on pop instead of on push.** An orange could be pushed twice in the same minute and decrement `fresh` twice. Set it to `2` the moment you push it.
- **One BFS per rotten orange.** It gives the wrong timing when you just add up results, and it's slower. Use one queue with all the sources.

## Say it in the interview

> "The rot spreads like a BFS, one layer per minute. And since all the rotten oranges spread at the same time, it's a multi-source BFS: I put every rotten orange in the queue at the start. I also count the fresh oranges. Then I process the queue level by level. Each level is one minute, and I rot each fresh neighbour, push it and decrement the fresh count. I stop when the queue is empty or nothing fresh is left. If fresh is zero I return the minutes; otherwise some orange was unreachable and I return -1. Each cell is handled once, so it's O(m·n) time and space."

## Follow-ups interviewers ask

- **"What if each cell's distance to the nearest rotten orange is needed?"** Same multi-source BFS. Store the level at which each cell was reached. That's LeetCode's *01 Matrix* and *Walls and Gates*.
- **"Why does BFS give the minimum time?"** BFS reaches cells in order of distance, so the first time it reaches a fresh orange is along a shortest path from the nearest rotten one. That's exactly when the rot would arrive.
- **"Can you avoid modifying the grid?"** Keep a separate `visited` grid, or a `time` grid initialised to -1, and use it instead of writing `2` into the input.
