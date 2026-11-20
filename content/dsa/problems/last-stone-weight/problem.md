---
id: lc-1046
title: Last Stone Weight
pattern: Max-heap simulation
timeBox: 15
summary: Repeatedly smash the two heaviest stones together and return the weight of whatever is left at the end.
hints:
  - "Every round you need the two heaviest stones, and every round the set of stones changes. Re-sorting each time works, but what structure keeps the maximum ready for you?"
  - "A max-heap gives you the heaviest stone in O(log n), and lets you push the leftover piece back in O(log n)."
  - "Put every stone in a max-heap (in Python, push negatives into heapq). While two or more stones remain, pop y and x; if they differ, push y − x. Return the last stone, or 0 if none."
insight: The rules always pick the two heaviest stones, and the set keeps changing as leftovers go back in. A max-heap is built for exactly "give me the biggest, then let me add more".
time: O(n log n)
space: O(n)
related: [lc-703, lc-215, lc-621]
---

## The problem in plain English

You get an array `stones` of positive weights. Each round:

1. Take the two **heaviest** stones, `y` and `x`, with `x ≤ y`.
2. Smash them together. If `x == y`, both are destroyed. Otherwise `x` is destroyed and `y` becomes a stone of weight `y − x`, which goes back into the pile.

Keep going until at most one stone is left. Return its weight, or `0` if nothing is left. There are at most 30 stones, each weighing between 1 and 1000.

Example: `stones = [2, 7, 4, 1, 8, 1]` → `1`. Smash 8 and 7 → 1 is left, so the pile is `[2, 4, 1, 1, 1]`. Smash 4 and 2 → `[2, 1, 1, 1]`. Smash 2 and 1 → `[1, 1, 1]`. Smash 1 and 1 → `[1]`. Answer `1`.

## Start with brute force

Each round, sort the pile, take the last two, and put the difference back.

That's O(n log n) per round. Each round removes at least one stone, so there are at most `n − 1` rounds: O(n² log n) overall. With `n ≤ 30` that is tiny and it would pass. Be honest about that in an interview. The reason to do better is that the same pattern shows up with `n = 10⁵`, where `n² log n` is around 10¹¹.

## Building the intuition

Look at what the simulation actually asks for, over and over:

- "What's the heaviest stone?"
- "Remove it."
- "Add this new stone."

Sorting answers the first question, but then you add a stone and the order is broken, so you sort again. You're paying to put **every** stone in order when you only ever look at the top two.

A **heap** is the structure that keeps only "who's on top" correct. It is a tree stored in an array where every parent is at least as large as its children (for a max-heap). That weaker rule is cheap to repair: adding or removing one item costs O(log n), not a full re-sort.

So the plan is just to run the simulation the problem describes, using a max-heap as the pile.

The one language trap: **Python's `heapq` and Java's `PriorityQueue` are min-heaps.** The standard Python move is to store `-weight`, so the heaviest stone becomes the most negative number and pops first. Java takes `Collections.reverseOrder()`. C++ `priority_queue` is already a max-heap. JavaScript has no heap at all, so the solution includes a small `MinHeap` class and stores negatives, exactly like the Python version.

## The optimal approach

1. Build a max-heap from all the stones.
2. While the heap has at least two stones:
   - pop `y` (heaviest), then pop `x` (second heaviest, so `x ≤ y`);
   - if `y != x`, push `y − x`.
3. Return the remaining stone, or `0` if the heap is empty.

The subtle detail is the **order of the two pops**. The first pop is the larger one. If you compute `x − y` instead, Python's negated version will happily push a negative weight, and your answer goes wrong without any error.

{{code}}

## Dry run

`stones = [2, 7, 4, 1, 8, 1]`

| Round | Heap (as a sorted view) | y | x | Pushed back |
|---|---|---|---|---|
| 1 | `8, 7, 4, 2, 1, 1` | 8 | 7 | 1 |
| 2 | `4, 2, 1, 1, 1` | 4 | 2 | 2 |
| 3 | `2, 1, 1, 1` | 2 | 1 | 1 |
| 4 | `1, 1, 1` | 1 | 1 | nothing (equal) |
| end | `1` | | | answer **1** |

(The heap doesn't store its items in sorted order; the column just shows what's inside.)

## Complexity

- **Time: O(n log n).** Building the heap is O(n) with heapify (or O(n log n) pushing one by one). Each round removes at least one stone, so there are at most `n − 1` rounds, each with O(log n) heap work.
- **Space: O(n).** The heap holds the stones. (C++ and Java copy them; Python builds a new negated list.)

## Edge cases and traps

- **One stone.** `[5]` → `5`. The loop never runs.
- **Everything cancels.** `[3, 3]` → `0`. Return 0 when the heap is empty, don't read its top.
- **Forgetting the default ordering.** A min-heap here smashes the two *lightest* stones. The code runs and returns a wrong number. Python `heapq`: negate. Java: `Collections.reverseOrder()`. C++: the default is already a max-heap.
- **Pushing zero.** If `y == x`, push nothing. Pushing a `0` stone happens to give the same result here, but it's wrong to the problem's rules and costs an extra round.
- **Negation sign slips in Python.** Pop gives `-y`; you need `y = -heappop(heap)`, and you push `-(y - x)`.

## Say it in the interview

> "This is a straight simulation, and the only question is the data structure. Every round I need the two heaviest stones and then I may add a new one, so a max-heap fits perfectly. I heapify all stones, then while there are at least two I pop y and x, and if they're different I push y minus x back. At the end I return the last stone or zero. Each round is O(log n) and removes at least one stone, so it's O(n log n) overall. In Python I'd negate weights because heapq is a min-heap."

## Follow-ups interviewers ask

- **"Could you do it without a heap?"** Weights are at most 1000, so you can bucket-count weights and walk down from 1000. That's O(n + W), where W is the max weight.
- **"What if you could choose any two stones to smash and wanted the smallest possible last stone?"** That's a different problem (*Last Stone Weight II*): split the stones into two groups with sums as close as possible, a knapsack-style DP from the Dynamic Programming stage.
- **"What's heapify's cost?"** O(n), not O(n log n): most nodes are near the bottom and barely move.
