---
id: lc-23
title: Merge k Sorted Lists
pattern: Min-heap of list heads
timeBox: 40
summary: Given k sorted linked lists, splice them all into one sorted linked list.
hints:
  - "At any moment, the next node of the answer must be the head of one of the k lists. Which one?"
  - "Scanning all k heads to find the smallest costs O(k) per node. You need a structure that hands you the minimum of k things fast, even as they change."
  - "Put every non-empty head into a min-heap keyed by value. Pop the smallest, attach it to the result, and push that node's next (if any). The heap never holds more than k nodes."
insight: The next node of the answer is always the smallest of the k current heads. A min-heap keeps those k heads and gives you the smallest in O(log k), so every node costs O(log k) instead of O(k).
time: O(N log k)
space: O(k)
related: [lc-21, lc-703, lc-215, lc-295]
---

## The problem in plain English

You get an array `lists` of `k` linked lists. Each list is sorted in ascending order. Merge them all into **one** sorted linked list and return its head.

`k` can be 0. Any list can be empty. Let `N` be the total number of nodes across all lists.

Example: `lists = [[1, 4, 5], [1, 3, 4], [2, 6]]` → `[1, 1, 2, 3, 4, 4, 5, 6]`.

## Start with brute force

**Option A:** dump every value into an array, sort it, and build a new list. That's O(N log N), and it ignores the fact that the lists were already sorted.

**Option B:** merge the lists one at a time, the way you did in *Merge Two Sorted Lists*: merge list 1 into list 2, that result into list 3, and so on. It's correct, but the merged list keeps growing, and you walk it again for every new list. With `k` lists of `n` nodes each, that's `n + 2n + 3n + … + kn`, which is about `k²n / 2` steps. For `k = 10⁴` lists of 50 nodes, that's 2.5 billion steps.

## Building the intuition

This Hard is two Medium ideas stacked together: **merging two sorted lists** (Linked Lists stage) and **"keep the smallest of many things handy"** (Heaps & Greedy stage).

Start with what you know. In *Merge Two Sorted Lists*, you look at two heads and take the smaller one. Now imagine `k` heads lined up:

```text
list 0:  [1] → 4 → 5
list 1:  [1] → 3 → 4
list 2:  [2] → 6
```

The first node of the answer must be one of the bracketed heads. Nothing deeper in a list can be smaller than its own head. So the answer's next node is **the minimum of the k heads**. Take it. Its list now has a new head, so look at the k heads again.

Done naively, "find the minimum of k heads" is a scan of `k` items for each of the `N` nodes. That's O(N·k). But look at *how* the set of heads changes. Each step removes one item (the smallest) and adds one item (its successor). "Give me the minimum, then let me insert something" is exactly what a **min-heap** does, in O(log k) per operation.

There's a second route to the same speed: **divide and conquer**. Merge the lists in pairs (0 with 1, 2 with 3, …), then merge those results in pairs, and so on. There are `log k` rounds, and each round touches every node once. That also gives O(N log k). We show the heap version in code because it's the one you'll reuse most often (see *Find Median from Data Stream*). The pairwise version is a good follow-up answer.

## The optimal approach

1. Push the head of every non-empty list into a min-heap ordered by `val`.
2. Make a **dummy** node and a `tail` pointer to it, so attaching the first real node needs no special case.
3. While the heap isn't empty:
   - pop the smallest node and attach it: `tail.next = node; tail = node`;
   - if `node.next` exists, push it. That list's next candidate is now in the heap.
4. Return `dummy.next`.

**The subtle detail: ties in Python.** `heapq` compares tuples element by element. If two nodes have the same `val`, Python would compare the next element, the `ListNode`s, and crash, because `ListNode` has no `<`. So we push `(val, i, node)`, where `i` is the list's index. Two entries never share both `val` and `i`, so the comparison never reaches the node. Java and C++ take a comparator, and JavaScript has no built-in heap, so the JS solution includes a small `MinHeap` class.

We **reuse the original nodes**. We only rewire `next` pointers and never allocate a new node, so the extra space is just the heap.

{{code}}

## Dry run

`lists = [[1, 4, 5], [1, 3, 4], [2, 6]]`. Heap entries are written `value (list)`.

| Step | Heap before pop | Pop | Push | Result so far |
|---|---|---|---|---|
| start | `1(0), 1(1), 2(2)` | — | — | — |
| 1 | `1(0), 1(1), 2(2)` | `1(0)` | `4(0)` | `1` |
| 2 | `1(1), 2(2), 4(0)` | `1(1)` | `3(1)` | `1 1` |
| 3 | `2(2), 3(1), 4(0)` | `2(2)` | `6(2)` | `1 1 2` |
| 4 | `3(1), 4(0), 6(2)` | `3(1)` | `4(1)` | `1 1 2 3` |
| 5 | `4(0), 4(1), 6(2)` | `4(0)` | `5(0)` | `1 1 2 3 4` |
| 6 | `4(1), 5(0), 6(2)` | `4(1)` | — (end of list 1) | `1 1 2 3 4 4` |
| 7 | `5(0), 6(2)` | `5(0)` | — | `… 5` |
| 8 | `6(2)` | `6(2)` | — | `1 1 2 3 4 4 5 6` |

The heap never holds more than 3 entries, one per list.

## Complexity

- **Time: O(N log k).** Every one of the `N` nodes is pushed once and popped once. Each heap operation costs O(log k) because the heap holds at most `k` entries. Building the first heap is O(k).
- **Space: O(k)** for the heap. The output reuses the input nodes.

## Edge cases and traps

- **`lists` is empty, or every list is empty.** The heap starts empty, the loop never runs, and `dummy.next` is `null`. That's correct.
- **Pushing `null`.** Skip empty lists when you seed the heap, and only push `node.next` when it exists. A `null` in the heap crashes the comparator.
- **Python tuple ties.** Without the index in `(val, i, node)`, equal values make `heapq` compare two `ListNode`s and raise a `TypeError`.
- **Max-heap by accident in C++.** `priority_queue` pops the *largest* by default. The comparator must be `a->val > b->val` to get a min-heap.
- **Pushing whole lists up front.** Some students push every node into the heap at the start. That works, but it's O(N log N) time and O(N) space, which throws away the sortedness.

## Say it in the interview

> "The next node of the merged list is always the smallest of the k current heads. Scanning k heads per node is O(N·k). Instead, I keep the heads in a min-heap. I pop the smallest, attach it behind a dummy node, and push its successor. Each node goes in and out of the heap once, at O(log k) each, so that's O(N log k) time and O(k) space. I reuse the original nodes, so nothing new gets allocated."

## Follow-ups interviewers ask

- **"Can you do it without a heap?"** Yes: divide and conquer. Merge lists in pairs, then merge the results in pairs. That's `log k` rounds, and each round touches all `N` nodes, so O(N log k) time. Done bottom-up with an interval that doubles each round, it uses O(1) extra space.
- **"The lists are too big for memory: they're sorted files on disk."** Same heap, but keep one read cursor per file. This is the k-way merge step of external sort.
- **"Return only the k-th smallest overall."** Stop after `k` pops. It's the same pattern as *Kth Largest Element in an Array*, with sorted inputs.
