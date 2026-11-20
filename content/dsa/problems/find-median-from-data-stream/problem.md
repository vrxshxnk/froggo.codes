---
id: lc-295
title: Find Median from Data Stream
pattern: Two heaps, balanced halves
timeBox: 40
summary: Design a structure that accepts numbers one at a time and can report the median of everything added so far at any moment.
hints:
  - "The median only depends on the middle of the sorted order. You don't need the whole order, just the largest number of the smaller half and the smallest number of the larger half."
  - "Keep the smaller half in a max-heap and the larger half in a min-heap. Their tops are exactly the two numbers next to the middle."
  - "On every add, push into the small half, then move its top over to the large half (this keeps the order right). If the large half is now bigger, move its top back. The small half always has the same size or one more, so the median is its top or the average of both tops."
insight: Split the numbers into a lower half (max-heap) and an upper half (min-heap) of equal size, give or take one. The median lives at the tops, so findMedian is O(1) and each add is just a couple of O(log n) heap moves.
time: O(log n) per addNum, O(1) per findMedian
space: O(n)
related: [lc-703, lc-215, lc-4]
---

## The problem in plain English

Build a class `MedianFinder` with:

- `MedianFinder()`: start with no numbers;
- `addNum(num)`: add the integer `num` to the collection;
- `findMedian()`: return the median of all numbers added so far, as a decimal.

The **median** is the middle value in sorted order. With an even count, it's the average of the two middle values. `findMedian` is only called after at least one add. Up to 5 × 10⁴ calls in total, and values run from −10⁵ to 10⁵.

Example:

```text
addNum(1)      collection [1]
addNum(2)      collection [1, 2]
findMedian()   → 1.5
addNum(3)      collection [1, 2, 3]
findMedian()   → 2.0
```

## Start with brute force

**Option A:** keep a plain list. `addNum` appends in O(1). `findMedian` sorts in O(n log n) and reads the middle. With 5 × 10⁴ calls split evenly, that's about 2.5 × 10⁴ sorts of up to 2.5 × 10⁴ items, roughly 10¹⁰ steps.

**Option B:** keep the list sorted. Insert with binary search plus a shift, which is O(n) per add because of the shift. Then `findMedian` is O(1). With 5 × 10⁴ adds, that's over 6 × 10⁸ element moves in the worst case. Better, but still too slow, and it's not what the interviewer is looking for.

## Building the intuition

This Hard is two Medium ideas stacked together: **"a heap gives you the top of a group in O(1)"** (*Kth Largest Element in a Stream*) and **"split the problem at the median"** (the same picture as *Median of Two Sorted Arrays*).

**Step 1: what does the median actually need?** Sort the numbers and draw a line down the middle:

```text
 smaller half      |    larger half
 1   3   4   [5]   |   [7]   8   9   12
```

The median is `(5 + 7) / 2`. You never looked at 1, 3, 4, 8, 9 or 12. You only need **the largest of the smaller half** and **the smallest of the larger half**. The rest just needs to be on the correct side.

**Step 2: "largest of a changing group" is a max-heap.** Keep the smaller half in a **max-heap** (`low`), whose top is its largest. Keep the larger half in a **min-heap** (`high`), whose top is its smallest. The two tops sit right next to the line.

**Step 3: two rules to maintain.**

- **Order:** every number in `low` is ≤ every number in `high`.
- **Balance:** `low` has the same size as `high`, or exactly one more.

With both rules holding: if `low` is bigger, the count is odd and the median is `low`'s top. Otherwise it's the average of the two tops.

**Step 4: adding without breaking the rules.** A new number might belong on either side. A neat trick avoids case analysis:

1. push `num` into `low`;
2. pop `low`'s top (the largest of `low` plus `num`) and push it into `high`. Now order holds, because whatever moved was ≥ everything left in `low`;
3. if `high` is now bigger than `low`, pop `high`'s top and push it into `low`. Balance holds again, and order still holds, because `high`'s smallest is moving down.

That's at most three heap operations per add.

## The optimal approach

1. `low` = max-heap, `high` = min-heap, both empty.
2. `addNum(num)`: push into `low`, move `low`'s top to `high`, and if `len(high) > len(low)`, move `high`'s top back to `low`.
3. `findMedian()`: if `len(low) > len(high)`, return `low`'s top. Otherwise return `(low.top + high.top) / 2`.

**The subtle detail: getting a max-heap in each language.** Python's `heapq` is only a min-heap, so `low` stores **negated** values: push `-num`, and read `-low[0]`. C++'s `priority_queue<int>` is already a max-heap, and the min-heap is `priority_queue<int, vector<int>, greater<int>>`. Java uses `PriorityQueue` with `Collections.reverseOrder()`. JavaScript has no heap at all, so the solution includes a small `MinHeap` class that takes a comparison function. Passing `(a, b) => a > b` turns it into a max-heap.

{{code}}

## Dry run

Add `5, 2, 8, 1`, asking for the median after each.

| Add | After push into low | After moving low's top to high | Rebalance? | low | high | Median |
|---|---|---|---|---|---|---|
| 5 | low `{5}` | low `{}`, high `{5}` | high bigger → move 5 back | `{5}` | `{}` | 5 |
| 2 | low `{5, 2}` | low `{2}`, high `{5}` | sizes equal | `{2}` | `{5}` | (2 + 5) / 2 = 3.5 |
| 8 | low `{8, 2}` | low `{2}`, high `{5, 8}` | high bigger → move 5 | `{5, 2}` | `{8}` | 5 |
| 1 | low `{5, 2, 1}` | low `{2, 1}`, high `{5, 8}` | sizes equal | `{2, 1}` | `{5, 8}` | (2 + 5) / 2 = 3.5 |

Check the last row: sorted `[1, 2, 5, 8]`, so the median is `(2 + 5) / 2 = 3.5`. Correct.

## Complexity

- **Time: O(log n) per `addNum`.** At most three heap pushes or pops. **O(1) per `findMedian`**: just two peeks.
- **Space: O(n).** Every number is stored in exactly one heap.

## Edge cases and traps

- **Integer division.** `(2 + 5) / 2` must be `3.5`. In Java and C++, cast to `double` before adding. That also avoids `int` overflow in other versions with large values.
- **Forgetting the order rule.** Pushing straight into whichever heap is smaller keeps the sizes balanced but can put a big number in `low`. Always pass through `low` and then `high`, or compare with the tops first.
- **Python sign errors.** `low` holds negatives. Push `-num`, and read `-low[0]`. Mixing these up is the most common bug.
- **Balance the other way round.** If you let `high` be the bigger one instead, the odd-count median is `high`'s top. Either convention works. Just pick one and keep `findMedian` consistent with it.
- **Duplicates.** `5, 5, 5` works fine. Ties can sit on either side of the line.

## Say it in the interview

> "The median only depends on the two numbers next to the middle. So I keep the smaller half in a max-heap and the larger half in a min-heap, with the small side allowed to hold one extra. To add, I push into the small heap, move its top to the large heap so the order stays right, and move one back if the large heap gets bigger. The median is either the small heap's top or the average of both tops. That's O(log n) per add, O(1) per query, and O(n) space."

## Follow-ups interviewers ask

- **"All numbers are between 0 and 100."** Keep 101 counters. `addNum` is O(1). `findMedian` walks the counters to the middle, O(101), which is constant.
- **"99% of numbers are in 0–100."** Counters for the common range, plus two small sorted lists (or heaps) for the outliers below and above. The median almost always lands in the counter range.
- **"Median of a sliding window of the last k numbers."** (LeetCode 480.) The same two heaps, but you also need to *remove* the number leaving the window. Use lazy deletion (a hash map of numbers to delete when they reach a top), or use two balanced sorted multisets instead of heaps.
