---
module: trees
title: Trees & BSTs
readTime: 10
summary: "Almost every tree problem comes down to one question: what does this subtree return to its parent? Learn to answer it, trust the recursion, and know when to pass information down instead, and tree problems stop being scary."
---

## Why this stage matters

Tree problems scare students because recursion feels like magic. You write a function that calls itself, try to trace it in your head, lose track three levels down, and start doubting everything.

This stage replaces "trace every call" with a habit you can rely on: **decide what one subtree reports to its parent, handle one node, and trust the rest.** Once that clicks, *Maximum Depth of Binary Tree*, *Diameter of Binary Tree* and *Lowest Common Ancestor of a Binary Tree* turn out to be the same five lines with different return values.

## The core idea

Think of a company. The CEO wants to know the size of the whole company. She doesn't count everyone herself. She asks each of her direct reports, "How many people are in your team, including you?" Each of them asks their own reports the same question, and so on down. Someone with no reports answers "1". Each manager adds up the answers, adds 1 for themselves, and reports upward.

Nobody sees the whole company. Everybody does one small job and **trusts the answers coming up from below**. That's recursion on a tree.

The precise version: a binary tree is either **empty** (`null`), or a **node** with a value, a left subtree and a right subtree. Each subtree is itself a binary tree. So to solve a problem for a tree, you:

1. **Decide what a subtree returns to its parent.** Its height? Whether it's valid? The node it found? This is the most important decision, and it's the spine of this stage.
2. **Handle the empty tree** (the base case).
3. **Combine** the two children's answers with the current node to get this node's answer.

### The leap of faith

When you write `left = height(node.left)`, don't go down into that call. Just *assume it returns the right height for that subtree*. This is called the **recursion leap of faith**, and it isn't wishful thinking. It's induction: if the empty tree is handled correctly, and every node combines correct child answers correctly, then every tree of every size is handled correctly. You check one node, not a thousand.

If you catch yourself tracing five levels deep, stop and ask: "Is my base case right? Is my combine step right for one node?" If both are yes, you're done.

## Four traversal orders

**DFS (depth-first search)** goes as deep as possible down one branch before backing up. Recursion is DFS for free, because the call stack remembers where to come back to. There are three DFS orders, depending on *when* you handle the node itself:

| Order | Visit sequence | Use it when |
|---|---|---|
| **Preorder** | node, left, right | the node needs to act before its children (copying a tree, passing bounds down, building from preorder) |
| **Inorder** | left, node, right | the tree is a BST and you want values **in sorted order** |
| **Postorder** | left, right, node | the node needs its children's answers first (height, diameter, LCA) |

For this tree:

```text
      4
     / \
    2   6
   / \   \
  1   3   7
```

- preorder: `4, 2, 1, 3, 6, 7`
- inorder: `1, 2, 3, 4, 6, 7`
- postorder: `1, 3, 2, 7, 6, 4`

Notice the inorder line: it's sorted. That's not a coincidence. In a **binary search tree (BST)**, everything in a node's left subtree is smaller than it and everything in its right subtree is larger. Inorder visits left, then node, then right, at every level, so **inorder traversal of a BST is always sorted**. *Kth Smallest Element in a BST* is that one fact plus a counter.

**BFS (breadth-first search)** visits the tree **level by level**: the root, then all its children, then all its grandchildren. It uses a queue instead of recursion. For the tree above, BFS gives `4 | 2, 6 | 1, 3, 7`.

### DFS or BFS?

- The problem talks about **levels, rows, "closest to the root", "what you see from the side"** → BFS. *Binary Tree Level Order Traversal* and *Binary Tree Right Side View*.
- The answer for a node depends on its **subtrees** (heights, sums, "does this subtree contain…") → DFS, usually postorder.
- Memory: DFS holds one path, which is O(h) for height `h`. BFS holds one level, which can be about n/2 nodes in a wide tree. A very deep, thin tree favours BFS, since recursion that deep can overflow the stack. A wide, shallow tree favours DFS.

## Passing down vs returning up

Information in a tree can flow two ways.

**Returning values up** (postorder): children compute something and hand it to the parent. Height, diameter and LCA work this way. The parent can't decide anything until it hears from below.

**Passing bounds down** (preorder): the parent hands its children a constraint, and each child checks itself against it. *Validate Binary Search Tree* is the classic. A node isn't just "bigger than its left child". It must lie inside a window `(low, high)` set by **all** its ancestors. So you pass the window down and tighten it at each step.

When you're stuck, ask: "Does a node need to know something about its *ancestors* (pass it down as a parameter) or about its *descendants* (return it up)?" Some problems need both.

## The templates

### 1. Return a value up (postorder DFS)

*Maximum Depth of Binary Tree*, *Invert Binary Tree*, *Lowest Common Ancestor of a Binary Tree*.

```python
def solve(node):
    if node is None:
        return BASE              # the answer for an empty tree
    left = solve(node.left)      # leap of faith
    right = solve(node.right)
    return combine(node, left, right)
```

### 2. Return one thing, record another

*Diameter of Binary Tree*. Use this when the value the parent needs (a height) differs from the answer you want (the longest path, which bends at some node and can't be extended upward).

```python
best = 0
def height(node):
    nonlocal best
    if node is None:
        return 0
    left, right = height(node.left), height(node.right)
    best = max(best, left + right)   # the answer, recorded on the side
    return 1 + max(left, right)      # what the parent can use
```

### 3. Pass bounds down (preorder DFS)

*Validate Binary Search Tree*.

```python
def valid(node, low, high):
    if node is None:
        return True
    if not (low < node.val < high):
        return False
    return valid(node.left, low, node.val) and valid(node.right, node.val, high)

valid(root, float("-inf"), float("inf"))
```

### 4. BFS one level at a time

*Binary Tree Level Order Traversal*, *Binary Tree Right Side View*.

```python
from collections import deque

queue = deque([root])            # check root is not None first
while queue:
    size = len(queue)            # freeze: exactly one level is in the queue
    for i in range(size):
        node = queue.popleft()
        # ... use node; i == size - 1 is the rightmost node of this level
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
```

## How to recognise this pattern

- The input is a `TreeNode root`. (Obviously, but also: the problem is now about **what each subtree returns**.)
- "depth", "height", "diameter", "balanced", "path" → return a value up.
- "valid BST", "every node must be within…" → pass bounds down.
- "level", "row", "left/right side view", "zigzag", "minimum depth" → BFS.
- "k-th smallest", "sorted", "successor" in a BST → inorder.
- "BST" plus "find" or "ancestor" → walk down one path using comparisons, O(h) instead of O(n).
- "rebuild the tree from traversals" → divide and conquer on index ranges.

## The mistakes everyone makes

1. **Tracing instead of trusting.** Check the base case and one node's combine step. Don't simulate the whole recursion.
2. **The wrong base case.** Stop at `null`, not at leaves. With `null → 0`, nodes with one child just work.
3. **Checking only parent and child in a BST.** The rule is about whole subtrees. `[5, 4, 6, null, null, 3, 7]` passes a child check and is still invalid.
4. **`INT_MIN`/`INT_MAX` as "infinity".** A node equal to `2147483647` then fails `val < high`. Use `long`, real infinity or `null` for "no bound".
5. **Edges vs nodes.** Depth counts nodes; diameter counts edges. Read which one is asked.
6. **Reading the queue size inside the BFS loop.** Freeze it once per level, or levels blur together.
7. **Forgetting the empty tree.** Many problems allow `root = null`. Return `0`, `[]` or `true` before touching `root.val`.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Invert Binary Tree | The leap of faith: fix one node, trust the recursion |
| Maximum Depth of Binary Tree | The first "what does a subtree return?": its height |
| Diameter of Binary Tree | Return one thing (height), record another (best path) |
| Binary Tree Level Order Traversal | BFS with the frozen queue size |
| Validate Binary Search Tree | Pass bounds down; INT_MIN/INT_MAX traps |
| Lowest Common Ancestor of a BST | Use BST order to walk one path, O(h) |
| Kth Smallest Element in a BST | Inorder of a BST is sorted; iterative inorder |
| Construct Binary Tree from Preorder and Inorder | Divide and conquer on index ranges |
| Binary Tree Right Side View | BFS, keep the last node of each level |
| Lowest Common Ancestor of a Binary Tree | The stage's boss: one return value, three meanings |

Try each problem for its time box before opening the walkthrough. Before you write any code, say out loud what your function returns for a subtree. If you can't say it in one sentence, that's where you're stuck, not the code.
