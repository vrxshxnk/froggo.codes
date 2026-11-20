---
id: lc-56
title: Merge Intervals
pattern: Sort by start, then sweep
timeBox: 25
summary: Given a list of intervals, merge every group that overlaps and return the non-overlapping result.
hints:
  - "Draw the intervals on a number line. Which ordering makes overlapping intervals sit next to each other in the list?"
  - "After sorting by start, the next interval either overlaps the block you're building or starts after it ends. It can never overlap an older block."
  - "Sort by start. Keep a list `merged`. For each interval: if its start <= the last block's end, set last end = max(last end, its end); otherwise append it as a new block."
insight: Once the intervals are sorted by start, an interval can only overlap the block you're currently building. One sweep, either stretching the last block or starting a new one, merges everything.
time: O(n log n)
space: O(n)
related: [lc-57, lc-253]
---

## The problem in plain English

You get an array `intervals` where each `intervals[i] = [start, end]` with `start <= end`. Two intervals **overlap** if they share at least one point. Touching counts: `[1, 4]` and `[4, 5]` overlap at 4. Merge every group of overlapping intervals into one interval that covers them all, and return the merged list. Any order is accepted.

There are up to 10⁴ intervals, and values go from 0 to 10⁴. The input isn't sorted.

Example: `[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`. `[1,3]` and `[2,6]` share 2..3, so they become `[1,6]`.

## Start with brute force

Compare every pair. If two intervals overlap, replace them with their union, and start over. Stop when a full pass finds no overlapping pair.

It's correct, but each pass is O(n²), and you can need up to n passes (each pass might merge only one pair). For n = 10⁴ that's up to 10⁸ comparisons per pass, and possibly thousands of passes.

## Building the intuition

First, nail down when `[a, b]` and `[c, d]` overlap. It's easier to say when they **don't**: one ends before the other starts, so `b < c` or `d < a`. Flip it and you get the overlap condition:

```text
a <= d  and  c <= b
```

Now draw the input on a number line. Your eye merges it left to right, because that's the order the intervals appear on the line. So sort by start and do the same.

After sorting, suppose you're building a block that currently spans `[1, 6]`, and the next interval is `[c, d]`. You already know `c >= 1`, because of the sort. So half of the overlap condition is automatic, and the whole test shrinks to **`c <= 6`**:

- If `c <= 6`, it overlaps: stretch the block's end to `max(6, d)`.
- If `c > 6`, there's a gap. Every later interval starts at `c` or later, so nothing later can reach back into `[1, 6]`. That block is **final**. Start a new one.

That last point is why one pass is enough: once a block is closed, you never look at it again.

## The optimal approach

1. Sort `intervals` by start.
2. Create an empty list `merged`.
3. For each `[start, end]` in sorted order:
   - If `merged` is non-empty and `start <= merged.last.end`, set `merged.last.end = max(merged.last.end, end)`.
   - Otherwise append `[start, end]` as a new block.
4. Return `merged`.

The subtle detail is the **`max`**. When one interval sits inside another, like `[1, 10]` followed by `[2, 3]`, writing `last.end = end` would shrink the block to `[1, 3]`. The block's end can only grow.

{{code}}

## Dry run

`intervals = [[2,6],[8,10],[1,3],[15,18],[9,9]]`. Sorted by start: `[1,3] [2,6] [8,10] [9,9] [15,18]`.

| interval | last block | start <= last end? | action | `merged` after |
|---|---|---|---|---|
| `[1,3]` | none | | new block | `[1,3]` |
| `[2,6]` | `[1,3]` | 2 <= 3 ✓ | end = max(3, 6) = 6 | `[1,6]` |
| `[8,10]` | `[1,6]` | 8 <= 6 ✗ | new block | `[1,6] [8,10]` |
| `[9,9]` | `[8,10]` | 9 <= 10 ✓ | end = max(10, 9) = 10 | `[1,6] [8,10]` |
| `[15,18]` | `[8,10]` | 15 <= 10 ✗ | new block | `[1,6] [8,10] [15,18]` |

The `[9,9]` row is the containment case: the `max` keeps the end at 10.

## Complexity

- **Time: O(n log n).** Sorting dominates. The sweep is O(n).
- **Space: O(n)** for the output. Sorting also uses O(log n) to O(n) extra memory, depending on the language.

## Edge cases and traps

- **`<` instead of `<=`.** `[1,4]` and `[4,5]` touch at 4 and must merge into `[1,5]`.
- **Forgetting `max`.** `[[1,4],[2,3]]` must stay `[[1,4]]`, not become `[[1,3]]`.
- **Not sorting.** `[[4,7],[1,4]]` merges to `[[1,7]]` only if you sort first.
- **Sorting by end.** Then a long interval with a big end, like `[1, 10]`, comes after the short ones it covers, and the "only the last block matters" argument breaks.
- **Comparing against the current interval instead of the block.** Always compare with the merged block's end, which may come from an interval several steps back.
- **One interval.** Return it as it is.

## Say it in the interview

> "Two intervals overlap when each one starts before the other ends. If I sort by start, half of that check is automatic, and any interval can only overlap the block I'm currently building. So I sort, then sweep. If the next start is at most the current block's end, I extend the end with a max, which handles intervals nested inside others. Otherwise I start a new block. Sorting is O(n log n), the sweep is O(n), and the output is O(n) space."

## Follow-ups interviewers ask

- **"What if the intervals arrive one at a time, as a stream?"** Keep the merged blocks in a balanced tree, like a `TreeMap`, keyed by start. Each insert finds its neighbours and merges in O(log n), plus the number of blocks it swallows.
- **"What if the list is already sorted and you add one interval?"** That's *Insert Interval*, the next problem. It skips the sort and runs in O(n).
- **"How many rooms do you need so no two overlapping meetings share one?"** That's *Meeting Rooms II*. You count the maximum overlap at any moment instead of merging.
