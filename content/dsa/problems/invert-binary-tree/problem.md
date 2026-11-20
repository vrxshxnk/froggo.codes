---
id: lc-226
title: Invert Binary Tree
pattern: Recursion on subtrees
timeBox: 15
summary: Turn a binary tree into its mirror image, so every left child becomes a right child and vice versa.
hints:
  - "Don't think about the whole tree. Think about one node. What has to be true about its two subtrees once the job is done?"
  - "A mirrored tree is a root whose left subtree is the mirror of the old right subtree, and whose right subtree is the mirror of the old left subtree."
  - "Write a function that mirrors a subtree and returns its root. At each node, mirror both children recursively, then plug them back in swapped. An empty tree returns null."
insight: The mirror of a tree is the root with its two mirrored subtrees swapped. Trust the recursive call to mirror each subtree, and your only job at one node is the swap.
time: O(n)
space: O(h)
related: [lc-104, lc-543, lc-105]
---

## The problem in plain English

You get the `root` of a binary tree. Every node has a value, a `left` child and a `right` child (either can be empty, written `null`). Flip the tree left-to-right, as if you held it up to a mirror, and return the root.

The tree has up to 100 nodes and can be empty.

Trees on this site are written in **level order**: row by row, left to right, with `null` for a missing child.

Example: `[4, 2, 7, 1, 3, 6, 9]` becomes `[4, 7, 2, 9, 6, 3, 1]`.

```text
before:          after:
      4                4
    /   \            /   \
   2     7          7     2
  / \   / \        / \   / \
 1   3 6   9      9   6 3   1
```

## Start with brute force

There isn't really a slower approach worth writing. Any correct answer has to touch every node, because every node's children change. So O(n) is already the floor.

The real question is *how* to organise the work. Students often try to do it level by level and get tangled: "swap 2 and 7, then swap 1 with 9 and 3 with 6, across the tree...". That's not even the right picture. You don't swap cousins; you swap each node's own two children, and the cousins end up in the right place by themselves.

## Building the intuition

Look at the picture again and ask: **what does the mirror look like, one node at a time?**

- The root `4` stays where it is.
- Its new left subtree is the old *right* subtree (`7, 6, 9`), but mirrored: `7, 9, 6`.
- Its new right subtree is the old *left* subtree (`2, 1, 3`), mirrored: `2, 3, 1`.

So "mirror the tree" is the same as "mirror both subtrees, then swap them". That's the same job on smaller trees. Whenever a problem says the same thing about a tree and its subtrees, you're looking at recursion.

Now the important part: **don't trace the recursion in your head.** Assume `invertTree(child)` already works and hands back a mirrored subtree. This is called the *leap of faith*. If the smallest case is right (an empty tree is its own mirror) and each node does its part correctly, the whole thing is right. That's just induction.

So the only question at a node is: *what do I return to my parent?* Answer: my own root, with my children mirrored and swapped.

## The optimal approach

1. If `root` is `null`, return `null`. An empty tree is already mirrored.
2. Mirror the left subtree and keep the result in `left`.
3. Mirror the right subtree and keep the result in `right`.
4. Set `root.left = right` and `root.right = left`.
5. Return `root`.

**The subtle detail:** save both results *before* assigning. If you write `root.left = invertTree(root.right)` and then `root.right = invertTree(root.left)`, the second line reads the child you just overwrote. You mirror the same subtree twice and lose the other one. Two temporaries (or Python's `a, b = b, a`) avoid it.

The swap happens after both children return, so this is a **postorder** traversal: children first, then the node. Swapping first and then recursing (preorder) also works here, because the swap doesn't care whether the children are already mirrored.

{{code}}

## Dry run

Tree `[4, 2, 7, 1, 3, 6, 9]`. Each row is one call finishing, in the order they finish.

| Call on | `left` returned | `right` returned | After the swap | Returns |
|---|---|---|---|---|
| 1 | `null` | `null` | 1 (leaf) | 1 |
| 3 | `null` | `null` | 3 (leaf) | 3 |
| 2 | 1 | 3 | 2 → left 3, right 1 | 2 |
| 6 | `null` | `null` | 6 (leaf) | 6 |
| 9 | `null` | `null` | 9 (leaf) | 9 |
| 7 | 6 | 9 | 7 → left 9, right 6 | 7 |
| 4 | 2 (now 3, 1) | 7 (now 9, 6) | 4 → left 7, right 2 | 4 |

Reading the final tree row by row: `[4, 7, 2, 9, 6, 3, 1]`. Leaves "swap" two nulls, which changes nothing. That's fine.

## Complexity

- **Time: O(n).** Each node is visited once and does O(1) work.
- **Space: O(h)**, where `h` is the tree's height. That's the recursion stack: one frame per node on the current path. A balanced tree has `h ≈ log n`; a tree shaped like a chain has `h = n`.

## Edge cases and traps

- **Empty tree.** The base case returns `null`, which is the right answer.
- **Overwriting before reading.** `root.left = invertTree(root.right); root.right = invertTree(root.left)` is the classic bug. Save both first.
- **Swapping values instead of nodes.** Swapping `left.val` and `right.val` only works for full trees. When one child is `null`, there's no value to swap. Swap the pointers.
- **Forgetting to return.** The function must return the root. A version that swaps but returns nothing gives the parent `null`.
- **Very deep trees.** A chain of 10⁵ nodes can overflow the call stack. Then use the iterative version below.

## Say it in the interview

> "The mirror of a tree is its root with the mirrors of its two subtrees swapped, so this is natural recursion. My function mirrors a subtree and returns its root. The base case is null, which is its own mirror. At each node I recurse on both children, save the results, then assign them swapped. That's O(n) time since every node is visited once, and O(h) space for the recursion stack."

## Follow-ups interviewers ask

- **"Can you do it without recursion?"** Yes. Put the root in a queue (or stack). Pop a node, swap its two children, push the non-null children. Every node still gets its children swapped exactly once. It's O(n) time, and the queue holds at most one level.
- **"How would you check whether a tree is symmetric?"** Compare the left subtree with the mirror of the right one: two pointers walk in opposite directions (`a.left` with `b.right`, `a.right` with `b.left`). It's the same "what do two subtrees return" shape.
