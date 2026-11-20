---
id: lc-236
title: Lowest Common Ancestor of a Binary Tree
pattern: Return what you found upward
timeBox: 25
summary: In an ordinary binary tree, find the deepest node that has both of two given nodes in its subtree.
hints:
  - "Without BST ordering you can't tell which side p or q is on, so you have to look in both subtrees. What should each subtree report back to its parent?"
  - "Let each call return p or q if it found one of them in its subtree, or null if it found neither. What does it mean when a node gets something non-null back from BOTH children?"
  - "If the current node is null, p or q, return it. Otherwise recurse left and right. If both sides return non-null, the current node is the LCA. If only one side is non-null, pass that one up."
insight: "Make every call return 'what I found below me': null, p or q, or the LCA itself. The first node where both children report something is where p and q split, so it's the answer, and it gets passed straight up to the root."
time: O(n)
space: O(h)
related: [lc-235, lc-543, lc-104]
---

## The problem in plain English

You get the `root` of a binary tree (**not** a search tree, so values are in no particular order) and two nodes in it, `p` and `q`. Return their **lowest common ancestor (LCA)**: the deepest node that has both `p` and `q` in its subtree. A node counts as its own ancestor, so if `q` is below `p`, the answer is `p`.

All values are unique, `p ≠ q`, and both are in the tree. It has 2 to 10⁵ nodes.

Example: `root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]`.

```text
          3
        /   \
       5     1
      / \   / \
     6   2 0   8
        / \
       7   4
```

- `p = 5`, `q = 1` → **3**.
- `p = 5`, `q = 4` → **5**, because `4` is inside `5`'s subtree.

## Start with brute force

Find the path from the root to `p` and the path to `q`, each with a full search of the tree. Then walk both paths from the root together. The last node they share is the LCA.

It's O(n) time, which is already optimal. But it walks the tree twice and stores two paths. With a parent-pointer map it gets similar: map every node to its parent, collect `p`'s ancestors in a set, then climb from `q` until you hit one. It's O(n) extra memory either way. Interviewers want the single-pass recursion, which uses only the call stack and is about six lines long.

## Building the intuition

In *Lowest Common Ancestor of a BST*, comparing values told you which way to go. Here they tell you nothing, so you have to search both subtrees. The useful question, as always in this stage, is: **what should a subtree return to its parent?**

Imagine sending a helper into each subtree with one job: "Tell me if you found `p` or `q` down there." Now stand at some node and look at the two answers:

- **Both sides found something.** One side has `p` and the other has `q`. They split right here, so this node is the LCA. Nothing lower contains both.
- **Only one side found something.** Both nodes (or the only one found so far) are on that side. Pass that answer up unchanged.
- **Neither side found anything.** Return `null`.

What if the current node *is* `p`? Then return it right away, without looking below. Either `q` is somewhere under `p` (and then `p` is the LCA), or `q` is elsewhere in the tree (and some ancestor will see `p` from one side and `q` from the other). Both ways, returning `p` is the right report.

Here's the clever part. Once a node finds itself to be the LCA and returns itself, every ancestor above it gets something non-null from just *one* side. So they pass it straight up, and the root returns the LCA. One return type, "what I found", carries three meanings: `null`, "one of them", and "the answer".

Take the leap of faith: assume each recursive call reports correctly for its subtree, and check that the node combines the two reports correctly. That's all you need.

## The optimal approach

1. If `root` is `null`, `p` or `q`, return `root`.
2. `left = lca(root.left, p, q)`.
3. `right = lca(root.right, p, q)`.
4. If both `left` and `right` are non-null, return `root`.
5. Otherwise return whichever is non-null (or `null` if both are).

**The subtle detail:** compare **nodes**, not values: `root is p` in Python, `root == p` on pointers in C++ and Java, `===` in JavaScript. Here the values are unique, so comparing them would happen to work. But node identity is what the problem means, and it keeps working if values repeat.

{{code}}

## Dry run

Tree above, `p = 7`, `q = 8`. Calls listed in the order they return.

| Call on | `left` got | `right` got | Returns |
|---|---|---|---|
| 6 | null | null | null |
| 7 | — | — | **7** (it's p, stop) |
| 4 | null | null | null |
| 2 | 7 | null | 7 |
| 5 | null (from 6) | 7 (from 2) | 7 |
| 0 | null | null | null |
| 8 | — | — | **8** (it's q, stop) |
| 1 | null (from 0) | 8 | 8 |
| 3 | 7 | 8 | **3**, both sides found something |

Now `p = 5`, `q = 4`: the call on `5` returns `5` at once, without looking below. The call on `1` finds nothing. So the root gets `5` from the left and `null` from the right, and passes `5` up. Correct, and `4` was never visited.

## Complexity

- **Time: O(n).** In the worst case, every node is visited once.
- **Space: O(h)** for the recursion stack: O(log n) for a balanced tree, O(n) for a chain.

## Edge cases and traps

- **One node is an ancestor of the other.** `p = 5`, `q = 4` must return `5`. The early `return root` handles it.
- **Returning `true`/`false` instead of nodes.** A boolean says *whether* something was found, not *what*. You lose the LCA when passing it up.
- **Not stopping at p or q.** If you recurse past `p`, you still get the right answer here, but you do extra work, and the logic gets harder to reason about.
- **Using the BST shortcut.** Values aren't ordered, so "both smaller, go left" gives wrong answers.

## Say it in the interview

> "Each call returns what it found in its subtree: null if neither node, p or q if it hit one, or the LCA. If the current node is null, p or q, I return it. Otherwise I recurse both ways. If both sides return something, p and q split here, so this node is the LCA. If only one side does, I pass that up. Every node is visited at most once, so it's O(n) time and O(h) stack space."

## Follow-ups interviewers ask

- **"What if p or q might be missing from the tree?"** Then a lone `p` coming back could be wrong. Count how many of the two you actually found, for example with a counter during a full traversal that doesn't stop early, and return `null` unless both were found.
- **"What if nodes have parent pointers?"** Then it's like finding where two linked lists meet: walk up from `p` and `q` together, and when one reaches the top, restart it from the other's start. They meet at the LCA. That's O(h) time and O(1) space.
