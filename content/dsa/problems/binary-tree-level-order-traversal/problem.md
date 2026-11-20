---
id: lc-102
title: Binary Tree Level Order Traversal
pattern: BFS one level at a time
timeBox: 25
summary: Return the values of a binary tree row by row, top to bottom, each row read left to right.
hints:
  - "Recursion naturally dives deep down one branch. You want the opposite: finish everything at depth 1 before touching depth 2. Which data structure hands things back in the order you put them in?"
  - "A queue. Put the root in. Each time you take a node out, put its children in at the back. The nodes come out level by level."
  - "To know where one level ends, read the queue's size at the start of each round. Pop exactly that many nodes: they are the current level, and everything they push is the next level."
insight: "A queue processes nodes in the order they were discovered, which for a tree means level by level. Freezing the queue's size at the start of each round tells you exactly which nodes belong to the current level."
time: O(n)
space: O(n)
related: [lc-199, lc-104, lc-994]
---

## The problem in plain English

You get the `root` of a binary tree. Return a list of lists: the first list holds the root's value, the second holds every value one level down (left to right), and so on. An empty tree gives an empty list.

The tree has up to 2,000 nodes.

Example: `[3, 9, 20, null, null, 15, 7]` → `[[3], [9, 20], [15, 7]]`.

```text
    3          level 0: [3]
   / \
  9   20       level 1: [9, 20]
     /  \
    15   7     level 2: [15, 7]
```

## Start with brute force

One way: first find the tree's height `h` (see *Maximum Depth of Binary Tree*). Then, for each depth `d` from 0 to `h − 1`, walk the whole tree from the root and collect the nodes at depth `d`, visiting left before right.

It's correct, and left-before-right gives the right order inside each level. But each of the `h` passes walks down from the root again. For a chain of 2,000 nodes, that's about 2,000 × 2,000 / 2 = 2 × 10⁶ steps for something that should take 2,000.

## Building the intuition

Imagine people standing in a queue at a ticket counter. When someone reaches the counter, they tell their two children to join the *back* of the queue. Who gets served when?

- The root is served first and sends `9` and `20` to the back.
- `9` is served (no children). `20` is served and sends `15` and `7` to the back.
- `15` and `7` are served.

Everyone on level 1 joined before anyone on level 2, because level-2 nodes are only added when level-1 nodes are served. So a **queue** (first in, first out) visits a tree level by level. This is **breadth-first search (BFS)**: spread across the width before going deeper. Recursion, which uses a stack, does the opposite: it goes deep first (DFS).

One problem left: the queue is just one long line. How do you know where level 1 ends and level 2 begins?

Look at the moment *just before* you start serving level 1. The queue holds exactly level 1 and nothing else, because the root has been served and nobody from level 1 has been served yet. So **read the queue's size right then**. Serve exactly that many people. They're the whole level, and everything they add behind them is the next level.

## The optimal approach

1. If `root` is `null`, return `[]`.
2. Put `root` in a queue.
3. While the queue isn't empty:
   1. `size = len(queue)`. This is the number of nodes on the current level.
   2. Pop `size` nodes. For each one, add its value to `level` and push its non-null children.
   3. Append `level` to the result.
4. Return the result.

**The subtle detail:** read the size *once*, before the inner loop. If you write `for i in range(len(queue))` in a language that re-checks the length every time, or loop `while queue` inside, the children you push join the current level and the rows blur together.

In JavaScript, `array.shift()` is O(n), which would make the whole thing O(n²) in the worst case. The JavaScript solution keeps a `head` index instead, so popping is O(1).

{{code}}

## Dry run

Tree `[3, 9, 20, null, null, 15, 7]`.

| Round | Queue at start | `size` | Popped (pushes) | `level` |
|---|---|---|---|---|
| 1 | `[3]` | 1 | 3 (push 9, 20) | `[3]` |
| 2 | `[9, 20]` | 2 | 9 (none), 20 (push 15, 7) | `[9, 20]` |
| 3 | `[15, 7]` | 2 | 15 (none), 7 (none) | `[15, 7]` |
| end | `[]` | — | — | — |

Result: `[[3], [9, 20], [15, 7]]`.

## Complexity

- **Time: O(n).** Every node is pushed once and popped once.
- **Space: O(n).** The queue holds at most one full level. The bottom level of a complete tree has about `n/2` nodes, so that's O(n). The output itself is also O(n).

## Edge cases and traps

- **Empty tree.** Return `[]`, not `[[]]`. Check for `null` before seeding the queue.
- **Pushing `null` children.** Only push real children, or you'll pop a `null` and crash on `.val`.
- **Size read inside the loop.** Freeze it before popping. Otherwise the next level leaks into this one.
- **`shift()` in JavaScript.** It moves every element. Use a head index, or swap in a fresh array each level.
- **Using a stack.** A stack gives you DFS order. Levels come out scrambled.

## Say it in the interview

> "This is BFS. A queue hands nodes back in the order I found them, so the tree comes out level by level. To separate the levels, at the start of each round I record how many nodes are in the queue. That's exactly the current level, so I pop that many, record their values, and push their children for the next round. Every node goes in and out once, so it's O(n) time, and the queue holds at most one level, which is O(n) in the worst case."

## Follow-ups interviewers ask

- **"Can you do it with DFS?"** Yes. Pass the depth down: `dfs(node, depth)`. If `depth == len(result)`, start a new row. Append the value to `result[depth]`, then recurse left before right. Each row still comes out left to right.
- **"Return the levels bottom-up."** Do the same BFS, then reverse the list of levels at the end. It's still O(n).
- **"Zigzag order: left-to-right, then right-to-left, alternating."** Do the same BFS and reverse every other `level` before appending it (or fill it from the back).
