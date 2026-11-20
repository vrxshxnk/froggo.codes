---
id: lc-104
title: Maximum Depth of Binary Tree
pattern: Return a value up the tree
timeBox: 15
summary: Count how many nodes lie on the longest path from the root down to a leaf.
hints:
  - "Suppose a friend tells you the depth of the left subtree and another tells you the depth of the right subtree. Can you work out the depth of the whole tree?"
  - "The whole tree is one level (the root) on top of its deeper subtree."
  - "Return 0 for an empty tree. Otherwise return 1 + max(depth of left, depth of right)."
insight: "Every subtree can answer the question \"how deep am I?\" for its parent. The answer for a node is 1 + the deeper of its two children's answers, and an empty tree answers 0."
time: O(n)
space: O(h)
related: [lc-543, lc-226, lc-102]
---

## The problem in plain English

You get the `root` of a binary tree. Return its **maximum depth**: the number of nodes on the longest path from the root down to a **leaf** (a node with no children).

The tree can be empty (depth 0) and has up to 10⁴ nodes.

Example: `[3, 9, 20, null, null, 15, 7]` has depth **3**. The longest path is `3 → 20 → 15` (or `3 → 20 → 7`), and it has 3 nodes.

```text
    3
   / \
  9   20
     /  \
    15   7
```

## Start with brute force

One honest first idea: find every root-to-leaf path, measure each one, and take the longest. You'd walk down from the root, carrying the current length, and record it at every leaf.

That actually works in O(n), because each node is on the way to its leaves only once. So the brute force isn't slow. It's just more machinery than you need: you're tracking a running length and a global best. The cleaner idea flips the direction. Instead of carrying information *down*, let each subtree send its answer *up*.

## Building the intuition

Stand at the root `3` and pretend you're lazy. You don't want to look at the whole tree. You ask two helpers:

- "Left helper, how deep is the subtree under `9`?" → **1**.
- "Right helper, how deep is the subtree under `20`?" → **2**.

Now you can answer for the whole tree without looking any further: the root adds one level on top of the deeper side. `1 + max(1, 2) = 3`.

How did the helpers answer? The same way. The helper at `20` asked *its* children (`15` and `7`, each depth 1) and said `1 + max(1, 1) = 2`. The helper at `9` asked two empty subtrees, each depth 0, and said `1 + max(0, 0) = 1`.

That's the question this whole stage keeps asking: **what does this subtree return to its parent?** Here it's simply "my depth". Once you pick that, the code writes itself, and you never have to trace more than one level. Trust that the recursive call returns the right depth. That's the leap of faith.

## The optimal approach

1. If `root` is `null`, return `0`. An empty tree has no levels.
2. Ask the left subtree for its depth: `left = maxDepth(root.left)`.
3. Ask the right subtree: `right = maxDepth(root.right)`.
4. Return `1 + max(left, right)`.

**The subtle detail:** the base case is the *empty* tree, not the leaf. With `null → 0`, a leaf correctly returns `1 + max(0, 0) = 1`, and a node with only one child still works: the missing side says 0, and `max` picks the real child. If you instead stop at leaves, you have to special-case nodes with one child, and that's where the bugs live.

This is a **postorder** traversal: the node does its work after both children have reported back.

{{code}}

## Dry run

Tree `[3, 9, 20, null, null, 15, 7]`, calls listed in the order they finish.

| Call on | `left` | `right` | Returns `1 + max` |
|---|---|---|---|
| 9 | 0 (null) | 0 (null) | 1 |
| 15 | 0 | 0 | 1 |
| 7 | 0 | 0 | 1 |
| 20 | 1 (from 15) | 1 (from 7) | 2 |
| 3 | 1 (from 9) | 2 (from 20) | **3** |

## Complexity

- **Time: O(n).** Each node is visited exactly once.
- **Space: O(h)** for the recursion stack, where `h` is the height. That's O(log n) for a balanced tree and O(n) for a chain.

## Edge cases and traps

- **Empty tree.** Must return 0, not 1. The `null → 0` base case handles it.
- **Counting edges instead of nodes.** This problem counts nodes, so a single node has depth 1. *Diameter of Binary Tree* counts edges. Read which one is asked.
- **Using `min` by accident or "fixing" one-child nodes.** With `null → 0`, `max` already handles a missing child. (The *minimum* depth problem is where one-child nodes really need care.)
- **Deep chains.** A chain of 10⁴ nodes means 10⁴ stack frames. Plain Python's default recursion limit is 1000, so on your own machine you'd need `sys.setrecursionlimit` or the BFS version below.

## Say it in the interview

> "Each subtree can report its own depth to its parent. An empty tree has depth 0, and any other node is one level on top of its deeper child, so depth is 1 plus the max of the two recursive calls. Every node is visited once, so it's O(n) time, and the recursion stack is O(h), the height of the tree. If the tree could be very deep, I'd switch to BFS and count levels instead."

## Follow-ups interviewers ask

- **"Do it iteratively."** BFS level by level, as in *Binary Tree Level Order Traversal*: each time you finish one level, add 1. The queue holds at most one level, and no recursion is involved.
- **"What about the minimum depth?"** Careful: a node with one child isn't a leaf, so you can't just swap `max` for `min`. If one side is empty, use the other side's depth. BFS is even nicer here, since the first leaf you meet is the answer.
- **"Check whether the tree is height-balanced."** Return the height up the tree, like here, but return −1 as soon as the two children's heights differ by more than 1. That stays O(n).
