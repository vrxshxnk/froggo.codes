---
id: lc-543
title: Diameter of Binary Tree
pattern: Return height, record the answer
timeBox: 15
summary: Find the number of edges on the longest path between any two nodes of a binary tree.
hints:
  - "Any path in a tree goes up to one highest node and then comes back down. Think about the path whose highest node is some node X."
  - "The longest path that bends at X is the longest way down its left side plus the longest way down its right side. So you need heights."
  - "Write a height function that returns 1 + max(left, right) to the parent, but before returning, update a global best with left + right. The answer is that best, not the root's height."
insight: "Every path has one highest node where it bends. At each node, left height + right height is the best path bending there. Record that in a global, but return only the taller side to the parent, because a path coming from above can use just one branch."
time: O(n)
space: O(h)
related: [lc-104, lc-236, lc-124]
---

## The problem in plain English

You get the `root` of a binary tree with at least one node. The **diameter** is the length of the longest path between any two nodes, measured in **edges** (the links between nodes), not nodes. The path does **not** have to pass through the root.

Example: `[1, 2, 3, 4, 5]` has diameter **3**. The path `4 → 2 → 1 → 3` (or `5 → 2 → 1 → 3`) has 3 edges.

```text
      1
     / \
    2   3
   / \
  4   5
```

The tree has up to 10⁴ nodes.

## Start with brute force

For every node, compute the height of its left subtree and its right subtree with a separate depth function (the one from *Maximum Depth of Binary Tree*). Their sum is the longest path that bends at that node. Take the maximum over all nodes.

It's correct. But each height call walks a whole subtree, and you make one for every node. On a chain of `n` nodes that's `n + (n−1) + … ≈ n²/2` steps. For `n = 10⁴`, that's 5 × 10⁷, and the work is wasted: the height of each subtree gets recomputed again and again.

## Building the intuition

First, picture any path in a tree. It climbs from one end up to a **highest node**, then goes down to the other end. Every path has exactly one such bending point. So:

> longest path overall = max over every node X of (longest path that bends at X)

And the longest path bending at X goes as deep as possible on the left and as deep as possible on the right. That's `height(left) + height(right)` edges, if height counts nodes. (Each of those nodes is one edge away from the previous one, and the edge into X closes the gap.)

So the brute force had the right idea. The waste is that it asks for heights separately. Notice that when you compute height bottom-up, you *already have* both children's heights at every node, at the moment you combine them. So do both jobs in one pass:

- **Return to the parent:** my height, `1 + max(left, right)`. The parent can only extend one branch of mine, because a path can't fork.
- **Record on the side:** `left + right`, the best path bending right here. Keep the maximum in a variable outside the recursion.

This split, *return one thing, record another*, is the key move. The value that's useful to the parent (height) isn't the answer, and the answer (a path that bends) can't be extended by the parent.

## The optimal approach

1. Keep `best = 0`, outside the recursive function.
2. Define `height(node)`:
   - If `node` is `null`, return 0.
   - `left = height(node.left)`, `right = height(node.right)`.
   - Update `best = max(best, left + right)`.
   - Return `1 + max(left, right)`.
3. Call `height(root)` and return `best`. Ignore the height it returns.

**The subtle detail:** units. `height` counts *nodes* on the way down, so a leaf has height 1 and `null` has height 0. With that convention, `left + right` is exactly the number of *edges* in the bent path. Try it on a single leaf: `0 + 0 = 0` edges. Correct.

{{code}}

## Dry run

Tree `[1, 2, 3, 4, 5]`, calls in the order they finish.

| Call on | `left` | `right` | `left + right` | `best` after | Returns |
|---|---|---|---|---|---|
| 4 | 0 | 0 | 0 | 0 | 1 |
| 5 | 0 | 0 | 0 | 0 | 1 |
| 2 | 1 | 1 | 2 | 2 | 2 |
| 3 | 0 | 0 | 0 | 2 | 1 |
| 1 | 2 | 1 | 3 | **3** | 3 |

Answer: `best = 3`.

Now a tree where the root is *not* on the longest path:

```text
        1
       /
      2
     / \
    3   4
   /     \
  5       6
 /         \
7           8
```

At node `2`: left height 3 (`3, 5, 7`), right height 3 (`4, 6, 8`), so `best = 6`. At the root, the left height is 4 and the right is 0, giving only 4. Returning `height(root)` or the root's sum would be wrong. `best` remembers the 6.

## Complexity

- **Time: O(n).** Each node is visited once, and each visit does O(1) work.
- **Space: O(h)** for the recursion stack: O(log n) if balanced, O(n) for a chain.

## Edge cases and traps

- **Assuming the path goes through the root.** It doesn't have to. That's why you need `best` instead of just the root's left and right heights.
- **Counting nodes instead of edges.** If you return `left + right + 1`, you're counting nodes. The single-node tree must give 0.
- **Returning `left + right` to the parent.** The parent can only use one branch. Returning the sum creates a "path" that forks.
- **A global that isn't reset.** In C++ or Java, if `best` is a field, reset it at the start of the public method. Otherwise a second call on the same object remembers the old answer.

## Say it in the interview

> "Every path bends at one highest node, and the longest path bending at a node is its left height plus its right height. So I do one postorder pass computing heights. Each call returns its height to the parent, 1 plus the taller child, because a parent can only extend one branch. Before returning, it updates a global best with left plus right. That's O(n) time instead of recomputing heights for every node, and O(h) stack space."

## Follow-ups interviewers ask

- **"What if each node has a value and you want the path with the largest sum?"** That's *Binary Tree Maximum Path Sum*. Same shape: record `node.val + left + right`, return `node.val + max(left, right)`. The new twist: clamp a negative child's contribution to 0, because you'd rather not use that branch at all.
- **"Can you avoid the global variable?"** Return a pair from each call, `(height, best inside this subtree)`, and combine the pairs at the parent. It's the same algorithm. The global is just shorter.
