---
id: lc-743
title: Network Delay Time
pattern: Dijkstra with a min-heap
timeBox: 25
summary: A signal starts at one node of a weighted directed network; find how long it takes to reach every node, or -1 if some node never hears it.
hints:
  - "Each node hears the signal at the moment of its shortest path from k. When does the last node hear it?"
  - "BFS finds shortest paths only when every edge costs the same. Here the edges have different travel times. Which node can you be sure about first?"
  - "Dijkstra: keep a min-heap of (time, node). Pop the smallest; if the node is new, that time is final, so push its neighbours with time + w. The answer is the largest final time, or -1 if a node was never settled."
insight: The node with the smallest tentative time can't be reached any faster, because every other route already costs more and weights are never negative. A min-heap hands you that node each time. That's Dijkstra, and the answer is the largest shortest-path distance.
time: O(E log E)
space: O(n + E)
related: [lc-1584, lc-778, lc-127, lc-1046]
---

## The problem in plain English

There are `n` network nodes labelled `1` to `n`. You get `times`, a list of **directed** edges `[u, v, w]`: a signal sent from `u` reaches `v` after `w` time units. The signal starts at node `k` at time 0 and spreads along every edge at once. Return the time at which **all** nodes have received it, or `-1` if some node can never receive it. Limits: `n ≤ 100`, up to 6000 edges, and `0 ≤ w ≤ 100`.

Example: `times = [[2,1,1],[2,3,1],[3,4,1]]`, `n = 4`, `k = 2` → `2`. Nodes 1 and 3 hear it at time 1, and node 4 hears it at time 2.

## Start with brute force

Each node hears the signal at the time of its **shortest path** from `k`, so the answer is the largest shortest-path distance.

The simplest way to get all those distances is **Bellman-Ford**: set `dist[k] = 0` and every other distance to infinity, then go over every edge and relax it (`dist[v] = min(dist[v], dist[u] + w)`). Repeat that `n − 1` times. It works because a shortest path uses at most `n − 1` edges. The cost is O(n · E), which is 600,000 steps here. That's fine for these limits, but it wastes a lot of work, and it falls over once graphs have 10⁵ nodes.

## Building the intuition

BFS is the shortest-path tool when every edge costs 1. Here a direct edge of cost 5 can lose to a two-edge path of cost 1 + 1, so "fewest edges" is not "fastest".

Picture water spreading from `k` through pipes of different lengths. Which node gets wet first? The one at the end of the **cheapest edge out of `k`**. Nothing can beat that, because any other route starts with a more expensive edge, and costs never go negative.

Now that node is settled. Its neighbours get new candidate times. Again, the unsettled node with the **smallest candidate time** is the next to get wet. Any other route to it would go through some other unsettled node, which already costs at least as much.

So the rule is: **repeatedly take the unsettled node with the smallest tentative time, and lock it in.** Picking "the smallest" over and over is what a **min-heap** does in O(log size). That's Dijkstra's algorithm.

To keep it simple, don't try to update entries already in the heap. Just push a new `(time, node)` pair whenever you find a route. A node can end up in the heap several times, but only its first pop is the real one. Later pops are **stale**, so skip them.

## The optimal approach

1. Build an adjacency list: `graph[u]` holds `(v, w)` pairs.
2. Set `dist[i] = -1` for every node (meaning not settled) and push `(0, k)` onto a min-heap.
3. While the heap isn't empty:
   - pop the smallest `(d, u)`; if `u` is already settled, skip it (it's stale);
   - otherwise set `dist[u] = d`, count it as settled, and track the max `d`;
   - push `(d + w, v)` for each neighbour `v` that isn't settled yet.
4. If all `n` nodes were settled, return the max time. Otherwise return `-1`.

The subtle detail is that **a distance is final when it's popped, not when it's pushed**. A node can be pushed with time 5 first and with time 2 later. The heap pops the 2 first, and the 5 is skipped as stale.

{{code}}

## Dry run

`times = [[1,2,5],[1,3,1],[3,2,1]]`, `n = 3`, `k = 1`

| Pop | Stale? | Settled after | Pushed | Heap after |
|---|---|---|---|---|
| (0, 1) | no | dist[1] = 0 | (5, 2), (1, 3) | (1,3), (5,2) |
| (1, 3) | no | dist[3] = 1 | (2, 2) | (2,2), (5,2) |
| (2, 2) | no | dist[2] = 2 | none | (5,2) |
| (5, 2) | **yes**, 2 is settled | | | empty |

All 3 nodes are settled, and the largest time is **2**. The direct edge 1 → 2 (cost 5) lost to 1 → 3 → 2 (cost 2).

## Complexity

- **Time: O(E log E).** Every edge pushes at most one entry, and each push or pop costs O(log E). Since E ≤ n², log E ≤ 2 log n, so you'll often see this written as O(E log n).
- **Space: O(n + E)** for the adjacency list and the heap.

## Edge cases and traps

- **Using BFS.** It returns the path with the fewest edges, not the fastest one. Example: 5 versus 1 + 1.
- **Locking in distances on push.** A distance is final only when it's popped.
- **Not skipping stale entries.** Without the skip you re-expand nodes, which is slower and can overwrite correct distances.
- **Unreachable nodes.** Edges are directed. If node `k` has no path to some node, return `-1`, not the max of the reachable ones.
- **Off-by-one on labels.** Nodes are `1..n`, so size arrays `n + 1`.
- **Negative weights.** Dijkstra breaks with them, though this problem guarantees `w ≥ 0`. With negative edges you'd use Bellman-Ford.

## Say it in the interview

> "Each node hears the signal at its shortest-path time from k, so I need the largest shortest-path distance. The weights are non-negative, so that's Dijkstra. I keep a min-heap of (time, node). When I pop a node for the first time, its time is final, and I push its neighbours with time + w. Later pops of the same node are stale and get skipped. If I settle all n nodes I return the max time, otherwise -1. O(E log E) time, O(n + E) space."

## Follow-ups interviewers ask

- **"Why does Dijkstra need non-negative weights?"** The proof assumes extending a path never makes it cheaper. A negative edge breaks that, so a node you already settled could later get a cheaper route.
- **"What if you can use at most K edges?"** That's *Cheapest Flights Within K Stops*. Use Bellman-Ford limited to K + 1 rounds, or run Dijkstra on (node, stops) states.
- **"Dense graph?"** With E close to n², an array-based Dijkstra (scan for the minimum each round, no heap) is O(n²), which beats O(n² log n). *Min Cost to Connect All Points* uses the same trick for Prim.
