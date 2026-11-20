---
id: lc-199
title: Binary Tree Right Side View
pattern: BFS, last node per level
timeBox: 25
summary: List the values you'd see standing to the right of a binary tree, one per level, from top to bottom.
hints:
  - "You see exactly one node per level. Which one, and is it always in the right subtree?"
  - "It's the rightmost node of each level, wherever it lives. A node deep in the left subtree is visible if nothing on the right reaches that depth."
  - "Run level-order BFS with the 'freeze the queue size' trick. In each round, the last node you pop is the rightmost one on that level. Record its value."
insight: "The right side view is just the last node of every level. Level-order BFS already hands you each level left to right, so record the final node of each round."
time: O(n)
space: O(n)
related: [lc-102, lc-104, lc-994]
---

## The problem in plain English

You get the `root` of a binary tree. Imagine standing to the right of it and looking left. On each level you can see only the **rightmost** node; it hides the others. Return the values you see, from the top level down.

An empty tree gives `[]`. The tree has up to 100 nodes.

Example: `[1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`.

```text
      1        ← see 1
     / \
    2   3      ← see 3
     \   \
      5   4    ← see 4 (5 is hidden behind it)
```

## Start with brute force

The usual wrong first idea isn't slow; it's incorrect: "start at the root and keep going right". On the tree above, that gives `1 → 3 → 4`, which happens to be right. Now try `[1, 2, 3, 4]`:

```text
      1        ← see 1
     / \
    2   3      ← see 3
   /
  4            ← see 4
```

Going right gives `[1, 3]` and stops. But from the right side you can still see `4`, because nothing on the right reaches that deep. **The visible node of a level can be in the left subtree.** So you need to look at every level properly.

A correct but roundabout approach: compute the full level-order list (*Binary Tree Level Order Traversal*), then take the last item of each level. It's O(n) and fine, but it stores every value only to throw most of them away.

## Building the intuition

The definition says "one node per level". So think in levels, and that means BFS.

In level-order BFS, nodes leave the queue **left to right** within a level, because each level's children are queued left child first. When you freeze the queue size at the start of a round, you know exactly how many nodes belong to this level. So you also know which pop is the **last** one: pop number `size − 1`. That's the rightmost node, the one you'd see.

So it's *Binary Tree Level Order Traversal* with one change: instead of collecting the whole level, record only its last node.

## The optimal approach

1. If `root` is `null`, return `[]`.
2. Put `root` in a queue.
3. While the queue isn't empty:
   1. `size = len(queue)`.
   2. Pop `size` nodes with index `i` from 0 to `size − 1`. Push each one's non-null children, left before right.
   3. When `i == size − 1`, append that node's value to the result.
4. Return the result.

**The subtle detail:** push the **left** child before the right. The "last pop is the rightmost" claim depends on that order. If you push right first, the last pop is the *leftmost* node, and you've built the left side view.

{{code}}

## Dry run

Tree `[1, 2, 3, 4]` (the one that breaks "keep going right").

| Round | Queue at start | `size` | Pops (pushes) | Last pop → recorded |
|---|---|---|---|---|
| 1 | `[1]` | 1 | 1 (push 2, 3) | **1** |
| 2 | `[2, 3]` | 2 | 2 (push 4), 3 (none) | **3** |
| 3 | `[4]` | 1 | 4 (none) | **4** |

Result: `[1, 3, 4]`. The `4` came from the left subtree, and BFS found it without any special case.

## Complexity

- **Time: O(n).** Every node is pushed and popped once.
- **Space: O(n).** The queue holds up to one full level, which can be about `n/2` nodes in a complete tree. The answer holds one value per level.

## Edge cases and traps

- **Only following right children.** It misses visible nodes in the left subtree, as in `[1, 2, 3, 4]`.
- **Empty tree.** Return `[]` before touching the queue.
- **Wrong push order.** Pushing right before left flips which node is last.
- **Reading the size inside the loop.** Freeze it at the start of each round, or levels blur together.

## Say it in the interview

> "The view shows the rightmost node of each level, and that node can be in the left subtree if the right side is shorter. So I do a level-order BFS. At the start of each round, I freeze the queue size, which is the number of nodes on this level, and since children go in left before right, the last node I pop in the round is the rightmost. I record its value. That's O(n) time and O(n) space for the queue."

## Follow-ups interviewers ask

- **"Can you do it with DFS?"** Yes. Recurse with `dfs(node, depth)`, visiting the **right** child before the left. The first node you reach at each new depth is the rightmost one: if `depth == len(result)`, append it. That's O(n) time and O(h) stack space, which is better than BFS for wide trees.
- **"Left side view?"** Record the first pop of each round instead of the last (or do the DFS going left first).
