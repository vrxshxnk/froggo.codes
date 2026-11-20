---
id: lc-1584
title: Min Cost to Connect All Points
pattern: Minimum spanning tree (Prim)
timeBox: 25
summary: Connect every point on a grid with the least total wire, where a wire's cost is the Manhattan distance between its two points.
hints:
  - "Every pair of points can be joined, and the cost is their Manhattan distance. You want the cheapest set of wires that connects everything. What is that set called in graph terms?"
  - "That's a minimum spanning tree. Kruskal sorts all ~n²/2 edges, which is O(n² log n). Can you grow the tree from one point instead, and avoid storing every edge?"
  - "Prim with plain arrays: keep best[v] = cheapest wire from the tree to v. Each round, add the outside point with the smallest best, then update best for the remaining points using the new point. That's n rounds of O(n)."
insight: The cheapest way to connect everything is a minimum spanning tree. On a complete graph, Prim's algorithm with a plain best[] array and no heap runs in O(n²), which is optimal, because the graph has about n² edges.
time: O(n²)
space: O(n)
related: [lc-743, lc-684, lc-1319, lc-778]
---

## The problem in plain English

You get `points`, a list of `n` distinct points `[x, y]` on a 2-D grid. Connecting points `i` and `j` costs their **Manhattan distance**: `|xi − xj| + |yi − yj|`. Return the minimum total cost so that every point can reach every other point, directly or through others. There are up to 1000 points, and coordinates range from −10⁶ to 10⁶.

Example: `[[0,0],[2,2],[3,10],[5,2],[7,0]]` → `20`.

## Start with brute force

Look at the answer's shape first. If the chosen wires contained a cycle, you could drop the most expensive wire in it and still be connected, for less money. So the cheapest network has **no cycles**: it's a tree with exactly `n − 1` wires. That tree is called a **minimum spanning tree** (MST).

Trying every possible spanning tree is hopeless, because a complete graph has an astronomical number of them. So the real starting point is the textbook MST algorithm, **Kruskal**:

1. List all `n(n − 1)/2` pairs with their costs, and sort them.
2. Walk through them cheapest first, and keep a wire only if Union-Find says its two ends aren't connected yet.

That's correct, and it's the Union-Find way to think about this problem. But for `n = 1000` it means building and sorting about 500,000 edges: O(n² log n) time and O(n²) memory. We can drop the log and the memory.

## Building the intuition

Kruskal works edge-first. Try growing the tree **point-first** instead, the way a city might lay cables outward from a power station.

Start with point 0 alone in the tree. Which point should join next? The one with the **cheapest wire to anything already in the tree**. This is safe: the tree has to reach outward somehow, and the cheapest wire crossing from "inside" to "outside" is always part of some MST. This rule is called the **cut property**.

So keep one number per outside point: `best[v]`, the cheapest wire from the tree to `v` so far. Each round:

- pick the outside point `u` with the smallest `best[u]`, add it, and pay `best[u]`;
- `u` might now offer a cheaper wire to some outside points, so update `best[v] = min(best[v], dist(u, v))`.

That's **Prim's algorithm**. The usual version picks the minimum with a heap. But here *every* pair is an edge, so a heap would hold about n² entries. Scanning the `best` array for the minimum takes just O(n), and we do it `n` times: **O(n²)** in total. You can't do better on a complete graph, since you need to look at every pair at least once.

## The optimal approach

1. Set `best = [∞] × n`, `inTree = [false] × n`, `best[0] = 0`, and `total = 0`.
2. Repeat `n` times:
   - find the point `u` not in the tree with the smallest `best[u]`;
   - mark `u` as in the tree, and add `best[u]` to `total`;
   - for every point `v` not in the tree, set `best[v] = min(best[v], |xu − xv| + |yu − yv|)`.
3. Return `total`.

The subtle detail is **`best[0] = 0`**. It makes the first round pick point 0 at no cost, so you don't need any special code to start the tree.

{{code}}

## Dry run

Points: P0 (0,0), P1 (2,2), P2 (3,10), P3 (5,2), P4 (7,0)

| Round | Picks | Pays | `best` after updating [P0..P4] (`·` = in tree) | total |
|---|---|---|---|---|
| 1 | P0 | 0 | [·, 4, 13, 7, 7] | 0 |
| 2 | P1 | 4 | [·, ·, 9, 3, 7] | 4 |
| 3 | P3 | 3 | [·, ·, 9, ·, 4] | 7 |
| 4 | P4 | 4 | [·, ·, 9, ·, ·] | 11 |
| 5 | P2 | 9 | all in tree | **20** |

In round 3, P3 offered P4 a wire of cost 4, cheaper than the 7 it had before.

## Complexity

- **Time: O(n²).** `n` rounds, and each does one O(n) scan for the minimum and one O(n) pass of updates. For n = 1000 that's about 2 million steps.
- **Space: O(n)** for `best` and `inTree`. We never store the edges.

## Edge cases and traps

- **One point.** The answer is `0`, and the loop handles it naturally.
- **Building all the edges for Kruskal or a heap.** It works, but it uses about 500,000 entries of memory, and in Python it can be slow.
- **Euclidean distance.** The problem uses Manhattan distance: `|dx| + |dy|`, with no square root.
- **Updating points already in the tree.** Only update the points that are still outside, or you'll overwrite values you've already paid.
- **Overflow worries.** One distance is at most 4 × 10⁶, which fits in an int. LeetCode guarantees the total fits in the return type.

## Say it in the interview

> "The cheapest network that connects everything is a minimum spanning tree. Kruskal would sort all n²/2 edges, which is O(n² log n). Since the graph is complete, I'll use Prim with arrays instead. I keep best[v], the cheapest wire from the tree to v. Each round I add the outside point with the smallest best and relax everyone else's best through it. That's n rounds of O(n), so O(n²) time and O(n) space, which is optimal because there are n² pairs."

## Follow-ups interviewers ask

- **"Show me Kruskal."** Sort every `(cost, i, j)`, then union cheapest first and add a cost whenever the union succeeds. Stop after `n − 1` successful unions. That's O(n² log n).
- **"When would you pick a heap for Prim?"** When the graph is sparse (E much smaller than n²). Then heap-based Prim is O(E log E), like Dijkstra.
- **"What if n were 10⁵?"** O(n²) is too slow. For Manhattan distance there's a known trick that limits each point to a few candidate neighbours, giving O(n log n) edges for Kruskal. It's rarely asked beyond a mention.
