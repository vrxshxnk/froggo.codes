---
id: lc-230
title: Kth Smallest Element in a BST
pattern: Inorder traversal is sorted
timeBox: 25
summary: Return the k-th smallest value stored in a binary search tree.
hints:
  - "If you had the values in sorted order, the answer would just be the item at position k − 1. Is there a way to visit a BST that gives you sorted order for free?"
  - "Inorder traversal (left subtree, node, right subtree) visits a BST from smallest to largest. You don't need the whole list, just a counter."
  - "Do the inorder walk with an explicit stack: push nodes while going left, pop one, count it, then move to its right child. Return the value when the count reaches k."
insight: "Inorder traversal of a BST visits values in increasing order. Walk inorder, count the nodes as you visit them, and stop at the k-th one. You never need to sort or even finish the walk."
time: O(h + k)
space: O(h)
related: [lc-98, lc-235, lc-215]
---

## The problem in plain English

You get the `root` of a **binary search tree (BST)**, where everything left of a node is smaller and everything right of it is larger, and an integer `k`. Return the **k-th smallest** value in the tree, counting from 1.

The tree has `n` nodes, with `1 ≤ k ≤ n ≤ 10⁴`, and values from 0 to 10⁴.

Example: `root = [5, 3, 6, 2, 4, null, null, 1]`, `k = 3` → **3**. Sorted, the values are `1, 2, 3, 4, 5, 6`, and the third one is 3.

```text
        5
       / \
      3   6
     / \
    2   4
   /
  1
```

## Start with brute force

Collect every value with any traversal, sort the list, and return `values[k − 1]`.

It works, and with 10⁴ nodes it's fast enough in practice. But it throws away the one thing the problem gave you, the BST ordering. It costs O(n log n) time and O(n) memory, even when `k = 1` and the answer is just the leftmost node. An interviewer will ask, "Can you use the fact that it's a BST?"

## Building the intuition

Where's the smallest value in a BST? Keep going left until you can't. In the tree above that's `1`.

What comes next? `1` has no right child, so the next value up is its parent, `2`. Then `2`'s right subtree (empty here), then its parent `3`, then everything in `3`'s right subtree (`4`), then `5`, then `6`.

That visiting order has a name: **inorder traversal**. For every node, visit its *left subtree*, then the *node itself*, then its *right subtree*. And because everything on the left is smaller and everything on the right is larger, **inorder visits a BST in sorted order**. This fact shows up again and again, so remember it.

So the sorted list already exists, hidden in the tree's shape. You don't have to build it. Walk inorder, count each node as you visit it, and stop at count `k`.

Why use a stack instead of recursion? Recursion works fine too, but stopping early from deep inside a recursive call is awkward: you need a flag or an exception. An explicit stack makes the walk a loop, and `return` just ends it.

## The optimal approach

1. Start with an empty `stack` and `node = root`.
2. While the stack isn't empty or `node` isn't `null`:
   1. While `node` isn't `null`: push it and go left. That reaches the smallest unvisited value.
   2. Pop the top node. This is the next value in sorted order. Subtract 1 from `k`.
   3. If `k == 0`, return its value.
   4. Set `node = node.right`. Its right subtree holds the next values.

**The subtle detail:** after popping a node, you move to its **right** child and go left again from *there*. You don't go back to its left side, because that was finished before you popped it. The stack always holds the ancestors whose own values are still waiting to be visited.

{{code}}

## Dry run

The tree above, `k = 3`.

| Step | Action | Stack (bottom → top) | `k` after |
|---|---|---|---|
| 1 | slide left from 5: push 5, 3, 2, 1 | `[5, 3, 2, 1]` | 3 |
| 2 | pop **1**, count it; its right is null | `[5, 3, 2]` | 2 |
| 3 | pop **2**, count it; its right is null | `[5, 3]` | 1 |
| 4 | pop **3**, count it → `k == 0` | `[5]` | 0 → return **3** |

We never touched `4`, `5`'s right side or `6`.

## Complexity

- **Time: O(h + k).** Sliding down to the smallest node costs `h` steps (the height). After that, each pop moves to the next value in order, and pushes and pops balance out to O(k) overall. In the worst case (k = n, or a chain), that's O(n).
- **Space: O(h).** The stack holds at most one root-to-leaf path.

## Edge cases and traps

- **Off by one.** `k` is 1-indexed. With the decrement-then-check style, `k == 0` means "this is the one".
- **Preorder or level order by mistake.** Only inorder is sorted. Preorder of the tree above starts `5, 3, 2…`.
- **Recursion that doesn't stop.** A recursive inorder that keeps walking after finding the answer is still correct but wastes time. Return early or use the stack.
- **A single node.** `k` must be 1, and the answer is the root.

## Say it in the interview

> "Inorder traversal of a BST visits values in increasing order, so the k-th node visited inorder is the answer. I do the traversal iteratively with a stack: go left as far as possible pushing nodes, pop one and count it, then move to its right child. When the count reaches k I return. That's O(h + k) time, because I stop early, and O(h) space for the stack."

## Follow-ups interviewers ask

- **"What if the tree changes often and you're asked for the k-th smallest many times?"** Store in each node the size of its left subtree, and update it on insert and delete. Then at each node: if `k` equals left size + 1, it's this node; if smaller, go left; otherwise subtract left size + 1 and go right. Each query is O(h).
- **"What about the k-th largest?"** Do a reverse inorder (right, node, left) and count the same way.
