---
id: lc-124
title: Binary Tree Maximum Path Sum
pattern: DFS that returns one thing, records another
timeBox: 40
summary: Find the largest sum of node values along any path in a binary tree, where a path can start and end at any nodes.
hints:
  - "Every path has one highest node, where it 'bends'. From there it goes down into the left subtree, the right subtree, both, or neither."
  - "Write a helper that returns the best sum of a path that starts at a node and goes straight down one side. A parent can extend that. A path that uses both sides can't be extended, so it has to be recorded somewhere else."
  - "At each node: left = max(0, gain(left child)), right = max(0, gain(right child)). Update a global best with node.val + left + right. Return node.val + max(left, right) to the parent."
insight: Treat every node as the possible top of the path. The best path bending there is node.val plus the best downward chain on each side, with negative chains dropped. Recursion can only hand one chain upward, so the two-sided answer goes into a global best instead.
time: O(n)
space: O(h)
related: [lc-543, lc-104, lc-53]
---

## The problem in plain English

You get the `root` of a binary tree. Node values can be **negative** (from −1000 to 1000). A **path** is a sequence of nodes where each neighbouring pair is joined by an edge, and no node appears twice. It doesn't have to pass through the root, and it doesn't have to start or end at a leaf. It must contain **at least one node**.

Return the largest possible **sum** of the values on a path. The tree has 1 to 3 × 10⁴ nodes.

Example: the tree `[-10, 9, 20, null, null, 15, 7]`:

```text
      -10
      /  \
     9    20
         /  \
        15    7
```

The best path is `15 → 20 → 7`, with sum `42`. It doesn't touch the root.

## Start with brute force

Any path is fixed by its two end nodes. For each start node, walk the tree as an undirected graph to every other node, adding values as you go. Keep the best sum. That's O(n) per start node, O(n²) total. For `n = 3 × 10⁴`, that's 9 × 10⁸ steps. Too slow, and it ignores the tree structure entirely.

## Building the intuition

This Hard is two Medium ideas stacked together: *Diameter of Binary Tree* (the path bends at some node, and a DFS that returns depth records the best bend) and *Maximum Subarray* (a running sum that's gone negative is better dropped).

**Step 1: every path has a top.** Pick any path in the tree. Exactly one of its nodes is the highest, closest to the root. Call it the path's **top**. From the top, the path goes down into the left subtree some distance, down into the right subtree some distance, or both, or neither.

So if you try every node as the top and compute the best path that bends there, the maximum over all nodes is the answer. That's n candidates. Now make each one O(1).

**Step 2: what does a bend need from below?** For the path bending at `node`, you want:

- the best **downward chain** starting at `node.left` (going straight down, never turning back up);
- the best downward chain starting at `node.right`.

Then the bend's sum is `node.val + leftChain + rightChain`.

**Step 3: drop negative chains.** If the best chain on the left sums to `−5`, don't take it. Stop the path at `node` instead. So use `max(0, chain)` on each side. It's the same logic as Kadane's algorithm, where you restart when the running sum goes negative.

**Step 4: the return/record split.** Here's the key point. Your recursive function can only **return one number** to its parent. What should it be? The parent wants to *extend* a path through this node. A path that uses **both** children of this node can't be extended, because adding the parent would give the node three edges in the path, which is a fork, not a path.

So the function does two different jobs:

- it **returns** `node.val + max(left, right)`, the best one-sided chain, which the parent can extend;
- it **records** `node.val + left + right`, the best path with its top here, into a global `best`.

## The optimal approach

1. Set `best = root.val`. A single node is a valid path, and this handles all-negative trees.
2. Define `gain(node)`:
   - if `node` is null, return 0;
   - `left = max(gain(node.left), 0)` and `right = max(gain(node.right), 0)`;
   - `best = max(best, node.val + left + right)`;
   - return `node.val + max(left, right)`.
3. Call `gain(root)` and return `best`.

**The subtle detail: don't clamp the node itself.** We clamp the *children's* chains at 0, but `node.val` is always included. A path must have at least one node. If every value is negative, say `[-3]`, the answer is `-3`, not 0. That's also why `best` starts at `root.val` and not 0.

{{code}}

## Dry run

The example tree `[-10, 9, 20, null, null, 15, 7]`. Post-order: children first.

| Node | left (clamped) | right (clamped) | Bend here: val + left + right | best after | Returns val + max(left, right) |
|---|---|---|---|---|---|
| 9 | 0 | 0 | 9 | 9 | 9 |
| 15 | 0 | 0 | 15 | 15 | 15 |
| 7 | 0 | 0 | 7 | 15 | 7 |
| 20 | 15 | 7 | **42** | 42 | 35 |
| −10 | 9 | 35 | 34 | 42 | 25 |

The root's bend (34) loses to the bend at 20 (42). The root's return value (25) is never used, because there's no parent.

## Complexity

- **Time: O(n).** Every node is visited once and does O(1) work.
- **Space: O(h)**, where `h` is the height of the tree, for the recursion stack. That's O(log n) for a balanced tree and O(n) for a chain.

## Edge cases and traps

- **All values negative.** `[-2, -1]` → `-1`. If you start `best` at 0, or clamp `node.val`, you'll wrongly return 0, which is the "empty path", and that's not allowed.
- **Returning the two-sided sum.** Returning `node.val + left + right` to the parent builds a fork. On `[1, 2, 3]` that's harmless, but on deeper trees it overcounts. Return the one-sided chain, and record the two-sided one.
- **Clamping in the wrong place.** Clamp the child gains with `max(…, 0)`. Don't clamp the return value. A negative return is fine, because the parent will clamp it.
- **Global state in Java/C++.** `best` lives in a field. Reset it inside `maxPathSum`, as we do, so calling the method twice on the same object doesn't leak the old answer.
- **Deep trees.** A chain of 3 × 10⁴ nodes means recursion depth 3 × 10⁴. That's fine in C++/Java on LeetCode. In Python, LeetCode raises the limit. In your own scripts, call `sys.setrecursionlimit`.

## Say it in the interview

> "Every path has a highest node where it bends. So I try every node as the top. The best path bending at a node is its value plus the best downward chain from each child, and I drop a chain if it's negative. My DFS returns the best one-sided chain, because that's all a parent can extend. The two-sided sum gets recorded in a global maximum. I initialise that with the root's value so all-negative trees work. One pass, O(n) time, O(h) stack."

## Follow-ups interviewers ask

- **"Return the path itself, not the sum."** Also record which node was the best top and whether each side was used. Then walk down from that node, following whichever child gave the larger gain at each step.
- **"Paths must go from leaf to leaf."** Stop clamping at 0. A leaf-to-leaf path must go all the way down on both sides. Only record a bend when both children exist.
- **"What about a general tree (any number of children)?"** At each node, keep the two largest non-negative child chains. The bend uses those two, and the return uses the largest one.
