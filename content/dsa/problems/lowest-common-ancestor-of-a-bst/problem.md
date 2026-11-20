---
id: lc-235
title: Lowest Common Ancestor of a BST
pattern: Walk down using BST order
timeBox: 25
summary: In a binary search tree, find the deepest node that has both of two given nodes in its subtree.
hints:
  - "Stand at the root. Compare p and q with the root's value. If both are smaller, where must both of them live?"
  - "While p and q are on the same side of the current node, the answer is on that side too, so step that way. What happens at the first node where they're not on the same side?"
  - "Start at the root. If both values are smaller, go left; if both are larger, go right; otherwise (they split, or one equals the node) the current node is the answer. No recursion needed."
insight: "In a BST, comparing p and q to a node tells you which side each one lives on. Walk down while they're on the same side. The first node where they split up, or where you meet one of them, is the lowest common ancestor."
time: O(h)
space: O(1)
related: [lc-236, lc-98, lc-704]
---

## The problem in plain English

You get the `root` of a **binary search tree (BST)**: for every node, everything in its left subtree is smaller and everything in its right subtree is larger. You also get two nodes in it, `p` and `q`. Return their **lowest common ancestor (LCA)**: the deepest node that has both `p` and `q` in its subtree.

A node counts as its own ancestor. So if `q` is somewhere below `p`, the answer is `p` itself.

All values are unique, `p ≠ q`, and both are guaranteed to be in the tree. It has 2 to 10⁵ nodes.

Example: `root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]`.

```text
        6
      /   \
     2     8
    / \   / \
   0   4 7   9
      / \
     3   5
```

- `p = 2`, `q = 8` → **6**. They're on opposite sides of the root.
- `p = 2`, `q = 4` → **2**. `4` is inside `2`'s subtree, and `2` is its own ancestor.

## Start with brute force

Ignore the BST property. Find the path from the root to `p` and the path from the root to `q` by searching the whole tree. Then walk both paths together from the root. The last node they share is the LCA.

It's correct for any binary tree. But searching without using the ordering costs O(n) per search, and storing the paths costs O(n) memory. With 10⁵ nodes, that's 10⁵ steps when the BST could get you there in about 17 (log₂ 10⁵).

## Building the intuition

Stand at the root `6` with `p = 3` and `q = 5`. You don't know where they are yet, but the BST rule tells you a lot:

- `3 < 6` and `5 < 6`, so **both** are in the left subtree. The root is a common ancestor, but not the lowest one. Something in the left subtree is lower and still covers both.

So step left to `2`:

- `3 > 2` and `5 > 2`. Both are on the right. Step right to `4`.

At `4`:

- `3 < 4` but `5 > 4`. They're on **different sides**. Any node below `4` sits on just one side, so it can't contain both. `4` is the lowest node that holds both. That's the answer.

The same stopping rule covers the "one is an ancestor of the other" case. With `p = 2`, `q = 4`, at the root both are smaller, so go left. At `2`, `p` *is* the node. `q` is below it, so nothing lower contains `p`. Stop and return `2`.

So there's no searching and no backtracking. It's like the binary search from the Binary Search stage, but on a tree: each comparison throws away a whole subtree.

## The optimal approach

1. Start with `node = root`.
2. If `p.val` and `q.val` are both less than `node.val`, set `node = node.left`.
3. Else if both are greater, set `node = node.right`.
4. Otherwise return `node`. This means either they're on different sides, or one of them equals `node`.

**The subtle detail:** the "otherwise" case is doing two jobs. You never need to check `node == p` or `node == q` separately. If `node.val == p.val`, then `p` is neither strictly less nor strictly greater, so neither "go" branch fires and you return `node`. Comparing values with strict `<` and `>` handles it for free.

{{code}}

## Dry run

Tree above, `p = 3`, `q = 5`.

| Step | `node` | `p = 3` vs node | `q = 5` vs node | Action |
|---|---|---|---|---|
| 1 | 6 | smaller | smaller | go left |
| 2 | 2 | larger | larger | go right |
| 3 | 4 | smaller | larger | **split → return 4** |

And `p = 2`, `q = 8`: at `6`, `2` is smaller and `8` is larger, so they split right away and the answer is `6`.

## Complexity

- **Time: O(h)**, the height of the tree. Each step goes one level down. That's O(log n) for a balanced BST, but O(n) for a BST shaped like a chain (for example, values inserted in sorted order).
- **Space: O(1).** It's a loop with one pointer. The recursive version uses O(h) stack instead.

## Edge cases and traps

- **One node is the ancestor of the other.** `p = 2`, `q = 4` must return `2`. The strict comparisons handle it.
- **p larger than q.** The order doesn't matter. The checks are symmetric, so don't assume `p < q`.
- **Using `<=` in the "go" checks.** With `p.val <= node.val`, you'd walk past `p` when `node == p`.
- **Ignoring the BST property.** The general-tree solution (*Lowest Common Ancestor of a Binary Tree*) also works, but it's O(n). Interviewers want you to use the ordering.

## Say it in the interview

> "Because it's a BST, comparing p and q with a node tells me which side each one is on. If both are smaller I go left; if both are larger I go right. The first node where they split, or where I hit one of them, is the lowest node containing both, so that's the LCA. It's a single walk down, O(h) time and O(1) space with a loop."

## Follow-ups interviewers ask

- **"What if it's not a BST?"** Then the values don't tell you which side to go, so you have to look in both subtrees. That's *Lowest Common Ancestor of a Binary Tree*, later in this stage: O(n), with a recursion that returns what it found to its parent.
- **"What if p or q might not be in the tree?"** First check that both exist with two BST searches (O(h) each). Then run the walk.
