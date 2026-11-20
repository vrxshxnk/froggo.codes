---
id: lc-778
title: Swim in Rising Water
pattern: Union-Find as the water rises
timeBox: 40
summary: In a grid of heights where the water level rises by one each second, find the earliest time you can swim from the top-left cell to the bottom-right.
hints:
  - "At time t you can stand on any cell whose height is at most t. So 'can I get across at time t?' is a plain reachability question. Is the answer monotone in t?"
  - "It is: if you can cross at t, you can cross at t + 1. Binary search on t with a BFS works in O(n² log n). Can you avoid redoing the BFS from scratch each time?"
  - "Raise the water one step at a time. At time t exactly one new cell (the one with height t) floods. Union it with its already-flooded neighbours, and return the first t at which the start and end share a root."
insight: Flooding cells in order of height and merging each one with its flooded neighbours builds the reachable regions incrementally. Because the heights are a permutation of 0..n²−1, you know which cell floods at each t without sorting, and the first moment the two corners share a Union-Find root is the answer.
time: O(n² · α(n²))
space: O(n²)
related: [lc-743, lc-1584, lc-547, lc-200]
---

## The problem in plain English

You get an `n × n` grid where `grid[r][c]` is the height of that cell. The heights are **all different** and are exactly the numbers `0` to `n² − 1`. It starts raining, and at time `t` the water is at height `t` everywhere. You can swim from a cell to one of its 4 neighbours if **both** cells have height `≤ t`, and swimming takes no time. Starting at `(0, 0)`, return the smallest `t` at which you can reach `(n − 1, n − 1)`. `n` is at most 50.

Example: `[[0,2],[1,3]]` → `3`. You can't stand on the bottom-right cell until the water reaches 3, and by then everything is connected.

## Start with brute force

For a fixed `t`, the question "can I get across?" is just a BFS over cells with height `≤ t`. So try `t = 0, 1, 2, …` and BFS each time. That's up to `n²` BFS runs of `n²` cells each: O(n⁴), about 6 million steps for n = 50. That's fine here, but it's the slow idea.

The answer is **monotone**: if you can cross at `t`, you can cross at any later time. So you can binary search on `t` instead. That's O(n² log n²), and it's a perfectly good interview answer (it's why the problem is tagged Binary Search). Another option is a Dijkstra-style min-heap that always expands the lowest reachable cell, which is O(n² log n).

## Building the intuition

Look at what changes as time goes from `t − 1` to `t`. Every cell's flooded status stays the same, except **one cell**: the one whose height is exactly `t`. The heights are a permutation, so there's exactly one.

Binary search and the brute force both throw away everything they learned and BFS from scratch. Instead, picture the flooded cells as islands of water that grow:

- At time `t`, the cell with height `t` floods.
- It joins any flooded neighbour's region. Two separate regions might merge right here.
- The moment `(0, 0)` and `(n − 1, n − 1)` are in the same region, you can swim across, so that `t` is the answer.

"Regions that only ever merge, and I keep asking whether two cells are in the same one" is exactly what Union-Find is built for. Each cell `(r, c)` becomes node `r · n + c`.

Because the heights are `0..n² − 1`, you don't even need to sort the cells. Build `cellAt[h]`, the cell whose height is `h`, in one pass.

## The optimal approach

1. Build `cellAt`: for every cell, `cellAt[grid[r][c]] = r · n + c`.
2. Make a DSU with `n²` nodes.
3. For `t = 0, 1, …, n² − 1`:
   - let `(r, c)` be the cell at `cellAt[t]`;
   - for each of its 4 neighbours inside the grid with height `≤ t` (already flooded), union the two cells;
   - if `find(0) == find(n² − 1)`, return `t`.

The subtle detail is the condition **`grid[nr][nc] <= t`**. A neighbour with a smaller height flooded at an earlier time, so it's already in some region. One with a bigger height isn't under water yet, so don't connect to it, even though it's adjacent.

{{code}}

## Dry run

`grid = [[0,2],[1,3]]`, so the cell numbers are `(0,0) = 0`, `(0,1) = 1`, `(1,0) = 2`, `(1,1) = 3`.

| t | Floods | Flooded neighbours | Unions | Start and end joined? |
|---|---|---|---|---|
| 0 | (0,0) | none (heights 1 and 2) | none | no |
| 1 | (1,0) | (0,0) | 2 ∪ 0 | no |
| 2 | (0,1) | (0,0) | 1 ∪ 0 | no |
| 3 | (1,1) | (0,1), (1,0) | 3 ∪ 1, 3 ∪ 2 | **yes** → return 3 |

## Complexity

- **Time: O(n² · α(n²)).** Each of the n² cells floods once, with up to 4 unions and 2 finds, each effectively O(1). Building `cellAt` is O(n²).
- **Space: O(n²)** for `cellAt` and the DSU arrays.

## Edge cases and traps

- **`n = 1`.** At `t = 0` the start is the end, so `find(0) == find(0)` and the answer is `0`.
- **Forgetting the start cell's own height.** You can't leave `(0, 0)` until `t ≥ grid[0][0]`. The union method handles it automatically, because cell 0 only joins anything once it floods.
- **Connecting to neighbours that aren't flooded.** Check `grid[nr][nc] <= t`, not just whether the neighbour is in bounds.
- **Treating it as a sum of heights.** The cost of a path is its **highest** cell, not the total. That's why plain shortest-path sums don't apply.

## Say it in the interview

> "At time t I can use every cell with height at most t, and the answer is the earliest t that connects the corners. Instead of re-running a BFS for each t, I raise the water one step at a time. The heights are a permutation of 0 to n² − 1, so exactly one cell floods at each t, and I can find it with a lookup array. I union it with its already-flooded neighbours and stop the first time the two corners share a root. O(n² · α) time, O(n²) space. Binary search plus BFS, or a min-heap Dijkstra on the max height, would also work in O(n² log n)."

## Follow-ups interviewers ask

- **"What if heights could repeat or be huge?"** Sort the cells by height, which makes it O(n² log n), and flood in that order. Or use the min-heap version: always expand the lowest reachable cell, and track the highest height you've popped.
- **"Explain the heap version."** It's Dijkstra where a path's cost is its maximum height instead of a sum. Pop the cell with the smallest cost, and push neighbours with cost `max(current, height)`.
- **"Where else does this 'merge as you sweep' idea show up?"** In Kruskal's MST (add edges cheapest first) and in counting islands as land is added one cell at a time (*Number of Islands II*).
