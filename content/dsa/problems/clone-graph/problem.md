---
id: lc-133
title: Clone Graph
pattern: DFS with an old-to-new map
timeBox: 25
summary: Given one node of a connected undirected graph, build and return a complete, independent copy of the whole graph.
hints:
  - "Copying one node is easy: make a new node with the same value. The hard part is the neighbours, which point back to nodes you may have already copied."
  - "The graph has cycles (if 1 is a neighbour of 2, then 2 is a neighbour of 1). A plain recursion would copy 1, then 2, then 1 again, forever. You need to remember what you've already copied."
  - "Keep a hash map from original node to its copy. clone(node): if it's in the map, return the copy. Otherwise create the copy, put it in the map first, then set its neighbours to clone(each neighbour)."
insight: A map from each original node to its copy does two jobs at once. It's the visited set that stops cycles, and it lets every edge point to the one copy of its neighbour. Insert the copy before recursing into neighbours.
time: O(V + E)
space: O(V)
related: [lc-138, lc-200, lc-207]
---

## The problem in plain English

A graph is a set of **nodes** joined by **edges**. In this problem each node has a value `val` (from 1 to 100, all different) and a list `neighbors` of the nodes it's joined to. The graph is **undirected**: if A is in B's neighbour list, B is in A's. It's also **connected**: you can reach every node from any node.

You get a reference to one node (the one with `val = 1`), or `null` for an empty graph. Return a **deep copy**: a brand-new set of nodes with the same values and the same connections, sharing **no** node objects with the original.

LeetCode shows the graph as an **adjacency list**: entry `i` lists the neighbours of node `i + 1`.

Example: `[[2,4],[1,3],[2,4],[1,3]]` is a square. 1 is joined to 2 and 4, 2 to 1 and 3, 3 to 2 and 4, and 4 to 1 and 3. You must return the copy of node 1 in a new square.

```text
1 --- 2
|     |
4 --- 3
```

## Start with brute force

First idea: copy the node you're given, then recursively copy each of its neighbours. Try it on the square. Copy 1, then copy its neighbour 2, then copy 2's neighbour… 1 again. And then 2 again. It never stops, because the graph has cycles.

Second idea: copy without recursion, but make a *new* copy every time you meet a node. That gives you a tree, not the square. Node 1's copy would point to one copy of 2, and node 3's copy would point to a *different* copy of 2. The shape is wrong.

Both failures have the same cause: **you have to know whether a node has already been copied, and if so, find that copy.**

## Building the intuition

"Have I seen this before, and what did I store for it?" That's a hash map question, the same one you answered in the Arrays & Hashing stage.

So keep a map `copies` from **original node → its clone**. Then cloning a node becomes:

1. Is it already in `copies`? Return that clone. Don't make another one.
2. Otherwise, make a new node with the same value and record it in `copies`.
3. For each neighbour of the original, clone that neighbour (with this same function) and add the result to the new node's neighbour list.

Step 1 fixes both failures at once. The infinite loop stops, because the second time you reach node 1 you just return its copy. And every edge points to **the one** copy of each node, so the shape is preserved.

This is a DFS, a depth-first search, over the graph. The `copies` map plays the role of the `visited` set you used on grids. A graph DFS is the same idea as the grid flood fill, except the neighbours come from a list instead of from the 4-direction array.

If you've done *Copy List with Random Pointer* in the Linked Lists stage, this is the same trick: map old to new.

## The optimal approach

1. If `node` is `null`, return `null`.
2. `copies = {}`.
3. `clone(original)`:
   - If `original` is in `copies`, return `copies[original]`.
   - `copy = Node(original.val)`.
   - `copies[original] = copy`. **Do this before the loop.**
   - For each `neighbor` in `original.neighbors`: append `clone(neighbor)` to `copy.neighbors`.
   - Return `copy`.
4. Return `clone(node)`.

**The subtle detail is the order in step 3.** You must store the copy in the map *before* visiting the neighbours. In the square, cloning 1 leads to cloning 2, which looks at its neighbour 1. If 1's copy weren't in the map yet, you'd start cloning 1 again: an infinite loop. Registering first means "1 is being copied, here's its copy, even though its neighbour list isn't finished yet". That's fine, because the list gets filled in before anyone reads it.

{{code}}

## Dry run

The square `[[2,4],[1,3],[2,4],[1,3]]`. Primes mark the copies: `2'` is the copy of node 2.

| Step | Call | In `copies`? | What happens |
|---|---|---|---|
| 1 | `clone(1)` | no | create `1'`; map `{1}`; visit neighbour 2 |
| 2 | `clone(2)` | no | create `2'`; map `{1, 2}`; visit neighbour 1 |
| 3 | `clone(1)` | **yes** | return `1'`, so `2'.neighbors = [1']`; visit neighbour 3 |
| 4 | `clone(3)` | no | create `3'`; its neighbour 2 is in the map, so `3'.neighbors = [2']`; visit 4 |
| 5 | `clone(4)` | no | create `4'`; neighbours 1 and 3 are both in the map: `4'.neighbors = [1', 3']` |
| 6 | back in 3 | | `3'.neighbors = [2', 4']`; return `3'` |
| 7 | back in 2 | | `2'.neighbors = [1', 3']`; return `2'` |
| 8 | back in 1 | | `1'.neighbors = [2']`; neighbour 4 is in the map: `1'.neighbors = [2', 4']` |

Four new nodes, each created exactly once, wired into the same square.

## Complexity

- **Time: O(V + E)**, where `V` is the number of nodes and `E` the number of edges. Each node is created once. Each neighbour-list entry is followed once, and the map lookups are O(1).
- **Space: O(V)** for the map, plus the recursion depth, which can reach `V` on a long chain. (That's at most 100 here.)

## Edge cases and traps

- **Empty graph.** The input is `null`: return `null`, don't crash on `node.val`.
- **A single node with no neighbours.** Return a new node with an empty list.
- **Registering the copy after the loop.** That's an infinite recursion on any cycle, and every undirected edge is a cycle of length 2.
- **Returning the original.** It "looks" right if you only print values. A deep copy must share no nodes. In Python you can check `clone is not node`.
- **Keying the map by value.** It works here because values are unique, but keying by the node itself is the general habit. It keeps working when values repeat.

## Say it in the interview

> "I'll do a DFS with a hash map from each original node to its copy. When I clone a node, I first check the map. If it's there, I return the existing copy. Otherwise I create the copy, put it in the map right away, then clone each neighbour and append it. Putting it in the map before recursing is what stops the cycle 1 → 2 → 1, and it makes every edge point to the single copy of each node. Every node and edge is handled once, so it's O(V + E) time and O(V) space."

## Follow-ups interviewers ask

- **"Can you do it iteratively?"** Yes, with BFS. Create the copy of the start node and put it in a queue. When you pop a node, for each neighbour: if it isn't in the map, create its copy and enqueue it. Then append the neighbour's copy to the popped node's copy.
- **"What if the graph is directed or disconnected?"** Directed works unchanged. For a disconnected graph you'd need a list of all nodes, and you'd run `clone` from each one that's not in the map yet.
- **"Why not key the map by `val`?"** You can, since values are unique, and an array of size 101 is even faster. But a node-keyed map is the version that survives duplicate values.
