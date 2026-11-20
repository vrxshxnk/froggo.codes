---
id: lc-684
title: Redundant Connection
pattern: Union-Find cycle detection
timeBox: 25
summary: A tree got one extra edge added to it; find the edge you can delete to make it a tree again.
hints:
  - "A tree on n nodes has exactly n − 1 edges and no cycle. One extra edge means exactly one cycle."
  - "Add the edges one at a time. Is there a moment when you can tell, instantly, that the edge you're about to add closes a loop?"
  - "Union-Find: for each edge (a, b), if a and b already have the same root, they were connected before this edge, so this edge closes the cycle. Return it."
insight: An edge closes a cycle exactly when its two ends are already connected. Union-Find answers "already connected?" in near O(1), and the first edge that fails to merge is the answer.
time: O(n · α(n))
space: O(n)
related: [lc-547, lc-1319, lc-207]
---

## The problem in plain English

You get `edges`, a list of `n` undirected edges on nodes labelled `1` to `n`. The graph started as a **tree** (connected, no cycles) and then one extra edge was added. Return an edge you can remove so the graph is a tree again. If several edges would work, return the one that appears **last** in `edges`. `n` is at most 1000.

Example: `edges = [[1,2],[1,3],[2,3]]` → `[2,3]`. The three edges form a triangle. Removing any one of them leaves a tree, and `[2,3]` comes last.

## Start with brute force

Try removing each edge, from last to first. After removing it, check whether what's left is a tree: run a DFS from node 1 and see if it reaches all `n` nodes using the remaining `n − 1` edges. The first edge that passes is your answer.

That's correct, but each check is O(n), and you might do `n` of them: O(n²). For `n = 1000` it's fine, but it's the wrong idea. It throws away everything it learned between checks.

## Building the intuition

Think about building the graph one edge at a time, starting from `n` isolated nodes.

Each edge either joins two separate pieces into one, or it connects two nodes that **can already reach each other**. The second kind is the only way to make a loop: you already had a path from `a` to `b`, and now there's a second one.

A tree has `n − 1` edges, so `n − 1` of our edges are joining edges. Exactly one edge is the loop-closer.

So the question is: when I look at edge `(a, b)`, are `a` and `b` already connected? Rerunning a DFS every time costs O(n) per edge. Union-Find answers it in practically O(1): `union(a, b)` returns `false` when `a` and `b` already share a root.

What about "return the last one"? The cycle is made of several edges, and any of them could be removed. We add edges in input order, and the cycle can't be complete until *all* of its edges are in. So the edge that completes it, the one where `union` first fails, is the cycle edge that appears last in the input. That's exactly what the problem asks for.

## The optimal approach

1. Build a DSU with `n + 1` slots (nodes are labelled from 1, so slot 0 just sits unused).
2. For each edge `(a, b)` in order:
   - if `union(a, b)` returns `false`, return `[a, b]`.
3. The input guarantees one extra edge, so step 2 always returns.

The subtle detail is the **order**. You don't need to find the whole cycle and then pick its latest edge. Processing in input order and returning the first failure gives you that edge for free.

{{code}}

## Dry run

`edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]`

| Edge | `find(a)` | `find(b)` | Same root? | Action |
|---|---|---|---|---|
| [1, 2] | 1 | 2 | no | merge, 2 goes under 1 |
| [2, 3] | 1 | 3 | no | merge, 3 goes under 1 |
| [3, 4] | 1 | 4 | no | merge, 4 goes under 1 |
| [1, 4] | 1 | 1 | **yes** | return `[1, 4]` |

The cycle is 1–2–3–4–1. Its edges appear at positions 0 to 3, and `[1, 4]` is the last of them. We never even look at `[1, 5]`.

## Complexity

- **Time: O(n · α(n)).** At most `n` unions, each effectively constant thanks to path compression and union by size.
- **Space: O(n)** for the DSU arrays.

## Edge cases and traps

- **Off-by-one on labels.** Nodes go from 1 to `n`, so the DSU needs `n + 1` slots. Allocating `n` crashes on node `n`.
- **Searching for the "last" edge separately.** Students find the cycle with DFS, then scan for the latest cycle edge. That works, but it's extra code. The first failing union already is that edge.
- **Returning `[b, a]`.** Return the edge exactly as it appears in the input.
- **Treating the graph as directed.** This problem is undirected. The directed version (*Redundant Connection II*) is much harder, because a node can also end up with two parents.

## Say it in the interview

> "A tree plus one edge has exactly one cycle, and an edge closes a cycle exactly when its endpoints are already connected. So I add edges in order with Union-Find. The first edge where both ends already share a root is the loop-closer. Since the cycle can't finish until its last edge arrives, that's also the cycle edge that appears last in the input, which is what they want. O(n · α(n)) time, O(n) space."

## Follow-ups interviewers ask

- **"Can you do it with DFS?"** Yes. Before adding each edge, DFS to check whether `a` already reaches `b`. That's O(n²), and it shows why Union-Find exists.
- **"What if the graph is directed?"** That's *Redundant Connection II*. Handle the case where a node has two parents separately from the plain-cycle case. Union-Find still does the cycle check.
- **"What if there could be several extra edges?"** Every failed union is an extra edge. Collect them all, and the graph minus those edges is a spanning forest.
