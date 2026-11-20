---
id: lc-98
title: Validate Binary Search Tree
pattern: Pass bounds down the tree
timeBox: 25
summary: Decide whether a binary tree follows the binary-search-tree rule at every node, not just between parents and children.
hints:
  - "Checking left.val < node.val < right.val at every node is not enough. Try [5, 4, 6, null, null, 3, 7]. Which node breaks the rule, and which ancestor does it break it against?"
  - "Every node lives inside a window of allowed values set by all its ancestors. Going left lowers the ceiling to the parent's value; going right raises the floor."
  - "Recurse with valid(node, low, high). Fail if node.val is not strictly between low and high. Recurse left with (low, node.val) and right with (node.val, high). Start with bounds outside the int range so INT_MIN and INT_MAX nodes aren't rejected."
insight: "A BST node isn't just bigger than its left child. It's bigger than everything in its left subtree and smaller than everything in its right. Carry an allowed (low, high) window down the tree, and tighten it at every step."
time: O(n)
space: O(h)
related: [lc-230, lc-235, lc-105]
---

## The problem in plain English

You get the `root` of a binary tree. Return `true` if it's a valid **binary search tree (BST)**:

- every value in a node's **left subtree** is **strictly less** than the node's value;
- every value in its **right subtree** is **strictly greater**;
- both subtrees are BSTs too.

"Strictly" means duplicates are not allowed. Values can be anywhere from `−2³¹` to `2³¹ − 1` (the full 32-bit int range), and the tree has 1 to 10⁴ nodes.

Example: `[2, 1, 3]` is valid. `[5, 1, 4, null, null, 3, 6]` is not, because `4` is in the right subtree of `5` but is smaller than 5.

## Start with brute force

Take the definition literally. For every node, walk its whole left subtree and check that every value is smaller, then walk its whole right subtree and check that every value is larger.

That's correct. But for every node you scan its subtree. On a chain of 10⁴ nodes that's about 10⁴ × 10⁴ / 2 = 5 × 10⁷ comparisons, and the same values get compared over and over.

## Building the intuition

The tempting shortcut is to check only parent-child pairs: `left.val < node.val < right.val`. Try it on this tree:

```text
      5
     / \
    4   6
       / \
      3   7
```

Every parent-child pair looks fine: `4 < 5 < 6` and `3 < 6 < 7`. But `3` sits in the right subtree of `5`, so it has to be greater than 5. It isn't. The local check misses it because the rule `3` breaks comes from its *grandparent*.

So what does node `3` actually need to satisfy? Walk the path to it:

- From `5` we went **right**, so everything below must be `> 5`.
- From `6` we went **left**, so everything below must be `< 6`.

Node `3` must lie in the window `(5, 6)`. It doesn't, so the tree is invalid.

That's the whole idea. **Every node has an allowed window `(low, high)` decided by its ancestors.** You don't need to remember the whole path, only the tightest floor and ceiling so far. Going left, the current node becomes the new ceiling. Going right, it becomes the new floor. The other bound is passed down unchanged.

Notice the direction. In *Maximum Depth of Binary Tree* information flowed **up**: children returned answers to parents. Here the key information flows **down**: parents hand their children a constraint. Many tree problems are one or the other, and knowing which is half the battle.

## The optimal approach

1. Define `valid(node, low, high)`.
2. If `node` is `null`, return `true`. An empty tree is a valid BST.
3. If `node.val <= low` or `node.val >= high`, return `false`.
4. Return `valid(node.left, low, node.val)` and `valid(node.right, node.val, high)`.
5. Start with `valid(root, −∞, +∞)`.

**The subtle detail: what is "infinity"?** Many students start with `low = INT_MIN` and `high = INT_MAX`. Then a single node with value `INT_MAX` (`2147483647`) fails the check `val < high`, and the code says a one-node tree is invalid. To fix it, the starting bounds must sit *outside* the int range. Python and JavaScript use real infinities. C++ and Java use 64-bit `long` bounds (`LLONG_MIN`, `Long.MIN_VALUE`), which are far below any int. Another common fix is to pass `null` meaning "no bound yet".

{{code}}

## Dry run

Tree `[5, 4, 6, null, null, 3, 7]`.

| Call | `low` | `high` | `val` in window? | Next |
|---|---|---|---|---|
| node 5 | −∞ | +∞ | yes | left with (−∞, 5) |
| node 4 | −∞ | 5 | yes | both children null → true |
| node 6 | 5 | +∞ | yes | left with (5, 6) |
| node 3 | 5 | 6 | **no: 3 ≤ 5** | return false |

The `false` travels up through `6` and `5`. The `and` stops early, so node `7` is never checked.

Now the edge case `[-2147483648, null, 2147483647]`: the root `INT_MIN` is inside `(−∞, +∞)`. Its right child `INT_MAX` is inside `(INT_MIN, +∞)`. Valid. With `INT_MIN`/`INT_MAX` as the starting bounds, both checks would have failed.

## Complexity

- **Time: O(n).** Each node is checked once against two numbers.
- **Space: O(h)** for the recursion stack: O(log n) if balanced, O(n) for a chain.

## Edge cases and traps

- **Checking only children.** `[5, 4, 6, null, null, 3, 7]` passes a parent-child check but is invalid.
- **Starting bounds of `INT_MIN`/`INT_MAX`.** Trees like `[2147483647]` or `[-2147483648]` are wrongly rejected. Use `long`, infinity or `null`.
- **`<=` versus `<`.** Duplicates are invalid. `[1, 1]` and `[2147483647, 2147483647]` must return `false`, so the check is strict on both sides.
- **Int overflow tricks.** Writing `node.val - 1` or `node.val + 1` as the new bound overflows at the extremes. Pass `node.val` itself and keep the comparison strict.

## Say it in the interview

> "Checking each node against its children isn't enough. A node must be within bounds set by all its ancestors. So I recurse with an allowed window, low and high. Going left, the current value becomes the upper bound; going right, it becomes the lower bound. A node outside its window fails. I start with bounds outside the int range, using long or infinity, so values like INT_MAX aren't rejected. That's O(n) time and O(h) stack."

## Follow-ups interviewers ask

- **"Is there another way?"** An **inorder** traversal of a BST visits values in sorted order. So walk inorder and check that each value is strictly greater than the previous one. It's also O(n). Keep `prev` as `null` at the start, not `INT_MIN`, for the same overflow reason.
- **"What if duplicates were allowed on the left?"** Change the left check to `val <= high` and keep the right strict. Make sure the rule is clear before you code.
