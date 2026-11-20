---
id: lc-105
title: Construct Binary Tree from Preorder and Inorder
pattern: Divide and conquer on ranges
timeBox: 25
summary: Rebuild a binary tree from two lists of its values, one in preorder and one in inorder.
hints:
  - "Which list tells you the root right away? Once you know the root, what does its position in the other list tell you?"
  - "preorder[0] is the root. In inorder, everything left of the root's position is the left subtree and everything right of it is the right subtree. Now you have two smaller versions of the same problem."
  - "Map each value to its inorder index. Recurse on an inorder range (lo, hi), taking the next root from a pointer that walks through preorder. Build the left subtree before the right, because that's the order preorder lists them in."
insight: "Preorder gives you roots in the order you need them; inorder tells you, for each root, which values go left and which go right. Consume preorder with one pointer, split inorder ranges with a hash map, and every node costs O(1)."
time: O(n)
space: O(n)
related: [lc-226, lc-98, lc-230]
---

## The problem in plain English

You get two integer arrays from the same binary tree:

- `preorder`: the values visited as **node, then left subtree, then right subtree**.
- `inorder`: the values visited as **left subtree, then node, then right subtree**.

Rebuild the tree and return its root. All values are **unique**, which is what makes the answer unique. Both arrays have the same length `n`, with 1 to 3,000 values.

Example: `preorder = [3, 9, 20, 15, 7]`, `inorder = [9, 3, 15, 20, 7]` → `[3, 9, 20, null, null, 15, 7]`.

```text
    3
   / \
  9   20
     /  \
    15   7
```

## Start with brute force

The idea below is the only sensible one. What separates the slow and fast versions is how you carry it out. The direct version does this at every step:

- take the root from the front of the current `preorder` slice;
- **scan** the current `inorder` slice to find the root's position;
- **copy** the four sub-slices (left/right of both arrays) and recurse.

The scan and the copies cost O(size of the subtree) at every node. For a tree shaped like a chain, the sizes are `n, n−1, n−2, …`, about `n²/2` in total. With `n = 3000` that's 4.5 million element copies, plus a fresh list at every level. It passes, but it's O(n²) time and memory, and the interviewer will ask you to fix it.

## Building the intuition

Look at what each traversal is good at.

**Preorder puts the root first.** `preorder[0] = 3`, so 3 is the root. No searching needed.

**Inorder puts the root in the middle.** Find `3` in `inorder = [9, 3, 15, 20, 7]`. Everything to its left, `[9]`, is the left subtree. Everything to its right, `[15, 20, 7]`, is the right subtree. Inorder tells you *how to split*.

Now each side is the same problem, just smaller. The left subtree is one node, `9`. For the right subtree, which of `15, 20, 7` is the root? Look at preorder again: after the root comes the **entire** left subtree (`9`), then the entire right subtree (`20, 15, 7`). So the right subtree's root is `20`. Split `[15, 20, 7]` around `20`: `15` goes left, `7` goes right. Done.

Notice the pattern in preorder: the roots appear *exactly in the order you'd create them*, if you always build a node's left subtree completely before its right. So you don't need to slice preorder at all. Keep one pointer into it, and each time you create a node, take the next value.

Two speed-ups remove all the waste:

1. **A hash map from value to inorder index** turns "find the root in inorder" into an O(1) lookup. Values are unique, so each one has exactly one index.
2. **Pass index ranges, not copies.** A subtree is just `inorder[lo..hi]`.

## The optimal approach

1. Build `index_in_inorder`: value → position in `inorder`.
2. Set `next_root = 0`, a pointer into `preorder`.
3. Define `build(lo, hi)`, which builds the subtree made of `inorder[lo..hi]`:
   1. If `lo > hi`, return `null`. The range is empty.
   2. `root_val = preorder[next_root]`, then add 1 to `next_root`.
   3. `mid = index_in_inorder[root_val]`.
   4. `root.left = build(lo, mid − 1)`, then `root.right = build(mid + 1, hi)`.
   5. Return the root.
4. Return `build(0, n − 1)`.

**The subtle detail:** the order of the two recursive calls matters. Preorder lists the whole left subtree before the right one. If you build the right subtree first, `next_root` hands it the left subtree's roots, and the tree comes out wrong. The shared pointer only works because the recursion follows preorder exactly: root, then left, then right.

{{code}}

## Dry run

`preorder = [3, 9, 20, 15, 7]`, `inorder = [9, 3, 15, 20, 7]`, so the map is `{9: 0, 3: 1, 15: 2, 20: 3, 7: 4}`.

| Call `build(lo, hi)` | Takes `preorder[next_root]` | `mid` | Then builds |
|---|---|---|---|
| (0, 4) | 3 | 1 | left (0, 0), right (2, 4) |
| (0, 0) | 9 | 0 | left (0, −1) → null, right (1, 0) → null |
| (2, 4) | 20 | 3 | left (2, 2), right (4, 4) |
| (2, 2) | 15 | 2 | both children null |
| (4, 4) | 7 | 4 | both children null |

`next_root` reaches 5 exactly when the last node is built, so every value is used once.

## Complexity

- **Time: O(n).** Building the map is O(n). Each `build` call that creates a node does O(1) work, and there are `n` such calls, plus at most `n + 1` calls that return `null`.
- **Space: O(n)** for the hash map, plus O(h) recursion stack (up to O(n) for a chain).

## Edge cases and traps

- **Building right before left.** The shared preorder pointer then feeds the wrong roots. Always build left first.
- **Scanning inorder with `index()`.** That's O(n) per node and O(n²) overall. Use the map.
- **Slicing arrays in Python.** `preorder[1:mid+1]` copies. It's correct but O(n²) for skewed trees. Pass indices instead.
- **Duplicate values.** The map, and the problem itself, need unique values. With duplicates, more than one tree can fit.
- **One node.** `build(0, 0)` creates it, and both children are `build` calls on empty ranges.

## Say it in the interview

> "preorder starts with the root, and the root's position in inorder splits the values into the left and right subtrees. So I recurse on inorder ranges. To find the split in O(1), I map each value to its inorder index. And because preorder lists roots in exactly the order I'll create them, if I build left before right, I can just walk a single pointer through preorder. Each node is O(1), so it's O(n) time and O(n) space for the map."

## Follow-ups interviewers ask

- **"What about inorder and postorder?"** Postorder puts the root *last*. So walk a pointer from the **end** of postorder, and build the **right** subtree before the left, because reading postorder backwards gives root, right, left.
- **"Can you rebuild from preorder and postorder?"** Not always uniquely. If a node has only one child, nothing tells you whether it's a left or a right child. Inorder is what pins down left versus right.
