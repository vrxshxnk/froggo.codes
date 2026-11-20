---
id: lc-57
title: Insert Interval
pattern: Three-phase sweep over sorted intervals
timeBox: 25
summary: Insert a new interval into a sorted list of non-overlapping intervals, merging wherever it overlaps.
hints:
  - "The list is already sorted and non-overlapping. Relative to the new interval, every existing interval is either completely to its left, overlapping it, or completely to its right."
  - "Those three groups come in order: all the left ones first, then the overlapping ones, then the right ones. How do you recognise the end of each group?"
  - "Copy intervals while `end < new.start`. Then, while `start <= new.end`, absorb them: new.start = min(...), new.end = max(...). Append the merged new interval, then copy the rest."
insight: Because the list is sorted and has no overlaps, the intervals split into three runs, before, overlapping and after, in that order. One pass copies the first run, absorbs the middle run into the new interval, and copies the last run.
time: O(n)
space: O(n)
related: [lc-56, lc-253]
---

## The problem in plain English

You get `intervals`, a list of `[start, end]` pairs that is **sorted by start** and has **no overlaps**. You also get one `newInterval = [start, end]`. Insert it so the list stays sorted and non-overlapping. If it overlaps or touches existing intervals, merge them into one. Return the new list.

There are up to 10⁴ intervals (possibly zero), and values go up to 10⁵.

Example: `intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]]`, `newInterval = [4,8]` → `[[1,2],[3,10],[12,16]]`. `[4,8]` overlaps `[3,5]`, `[6,7]` and `[8,10]` (it touches 8), and they all become `[3,10]`.

## Start with brute force

Append `newInterval` to the list and run *Merge Intervals*: sort by start, then sweep and merge.

That's correct and short, and it's a perfectly good first answer. But it costs O(n log n) for the sort, and it ignores the gift you were given: the list is **already sorted**. The interviewer is asking whether you can use that to get O(n).

## Building the intuition

Put the new interval on the number line among the old ones. Since the old intervals don't overlap each other and are sorted, each one falls into exactly one of three groups:

1. **Entirely to the left**: it ends before the new one starts (`end < new.start`).
2. **Overlapping**: it touches the new interval somewhere.
3. **Entirely to the right**: it starts after the new one ends (`start > new.end`).

And because the list is sorted, the groups appear **in this order**. All the left ones come first, then the overlapping ones, then the right ones. You never see a "left" interval after an "overlapping" one.

So you don't need to sort or compare pairs. Walk once with one index and three short loops:

- Copy while the interval is to the left.
- Absorb while the interval starts no later than the new one's end. Each absorbed interval can stretch the new one on either side.
- Copy everything that's left.

Why is "starts no later than the new end" enough for the middle loop? Phase 1 already removed everything that ends before the new start. So every remaining interval ends at or after `new.start`. If it also starts at or before `new.end`, the two satisfy the overlap condition from *Merge Intervals*: each one starts before the other ends.

## The optimal approach

1. `result = []`, `i = 0`, and `start, end = newInterval`.
2. **Before:** while `i < n` and `intervals[i].end < start`, append `intervals[i]` and move on.
3. **Overlap:** while `i < n` and `intervals[i].start <= end`:
   - `start = min(start, intervals[i].start)`,
   - `end = max(end, intervals[i].end)`, then move on.
4. Append `[start, end]`.
5. **After:** append every remaining interval.
6. Return `result`.

The subtle detail is the **strict and non-strict comparisons**. Phase 1 uses `<`: an interval ending exactly at `start` touches the new one, so it must be absorbed, not copied. Phase 2 uses `<=`: an interval starting exactly at `end` also touches, so it gets absorbed. Swapping either one leaves two touching intervals unmerged.

{{code}}

## Dry run

`intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]]`, `newInterval = [4,8]`

| phase | interval | test | action | new interval | `result` |
|---|---|---|---|---|---|
| before | `[1,2]` | 2 < 4 ✓ | copy | `[4,8]` | `[1,2]` |
| before | `[3,5]` | 5 < 4 ✗ | stop phase 1 | `[4,8]` | `[1,2]` |
| overlap | `[3,5]` | 3 <= 8 ✓ | absorb | `[3,8]` | `[1,2]` |
| overlap | `[6,7]` | 6 <= 8 ✓ | absorb | `[3,8]` | `[1,2]` |
| overlap | `[8,10]` | 8 <= 8 ✓ | absorb | `[3,10]` | `[1,2]` |
| overlap | `[12,16]` | 12 <= 10 ✗ | stop, append new | | `[1,2] [3,10]` |
| after | `[12,16]` | | copy | | `[1,2] [3,10] [12,16]` |

## Complexity

- **Time: O(n).** The index `i` only moves forward, and each interval is handled once.
- **Space: O(n)** for the output list. Besides that, only a few variables.

## Edge cases and traps

- **Empty `intervals`.** Return `[newInterval]`. The first two loops are skipped and step 4 appends it.
- **New interval goes first or last.** `[[3,5]]` + `[1,2]` → `[[1,2],[3,5]]`. `[[1,5]]` + `[6,8]` → `[[1,5],[6,8]]`. Both work with no special cases.
- **New interval swallows everything.** `[[1,2],[3,4]]` + `[0,10]` → `[[0,10]]`.
- **New interval sits inside an old one.** `[[1,5]]` + `[2,3]` → `[[1,5]]`. That's why you take `min` and `max`, not just the old interval's bounds.
- **Touching ends.** `[[1,5]]` + `[5,7]` → `[[1,7]]`. Check your `<` and `<=`.
- **Inserting into the input list in place.** In Java or Python, inserting into the middle of an array list is O(n) per insert and easy to get wrong. Build a new list.

## Say it in the interview

> "The list is sorted and non-overlapping, so relative to the new interval the old ones split into three runs in order: entirely before, overlapping, and entirely after. I walk once. I copy intervals that end before the new start. Then, while an interval starts at or before the new end, I absorb it by taking the min start and max end. I append the merged interval, then copy the rest. It's O(n) time, and the output is O(n) space. Appending and re-running Merge Intervals would also work, but that's O(n log n) and ignores the sorting."

## Follow-ups interviewers ask

- **"Can you find where the overlap starts faster?"** Yes, binary search finds the first interval with `end >= newStart` in O(log n). But building the output is still O(n), so the total doesn't improve unless you can edit the list in place.
- **"What if you insert many intervals, one after another?"** Keep the intervals in a balanced tree keyed by start, like a `TreeMap`, so each insert costs O(log n) plus the intervals it merges.
- **"Remove an interval instead of inserting one?"** The same three phases. In the middle phase, keep the pieces of each interval that stick out on the left or right of the removed range.
