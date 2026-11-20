---
module: final-boss
title: Intervals Finale
readTime: 7
summary: Two interval problems close the main track. Learn one overlap condition and one habit (sort by start, then sweep), and interval questions stop being a minefield of off-by-one errors.
---

## Why this stage matters

Interval problems look like geometry but they're really bookkeeping. Meetings, bookings, time ranges, IP ranges, video segments: real systems are full of them, which is why interviewers like them.

The slow idea is to compare **every pair** of intervals to see which overlap, which costs O(n²), and then compare again after each merge. The fast idea is that once you **sort by start**, each interval only needs to be compared with the block you're building right now. Sorting costs O(n log n) and the sweep after it costs O(n).

These two problems are short. What they test is whether you can get the boundaries exactly right: `<` or `<=`, `end` or `max(end, …)`. That's a good last skill to sharpen before the main track ends.

## The core idea

Picture booking a seminar hall for the day. Requests come in as time slots: 10–12, 11–13, 14–15. If you write them in order of start time, you can tell which ones clash just by reading down the list. You only compare each slot with the one you're currently tracking, never with all the others.

Now the precise version.

### The overlap condition

Two intervals `[a, b]` and `[c, d]` **don't** overlap exactly when one ends before the other starts: `b < c` or `d < a`. Flip that and you get the overlap condition:

```text
[a, b] and [c, d] overlap  <=>  a <= d  and  c <= b
```

In words: **each one starts before the other ends.** Memorise this one line. Every interval problem is built from it.

Whether touching counts (`[1, 4]` and `[4, 5]`) depends on the problem. Here both problems say it does, so we use `<=`. For half-open intervals like meeting times `[start, end)`, a meeting ending at 4 and one starting at 4 don't clash, and you'd use `<`. Read the statement and pick on purpose.

### Sort by start, and half the check disappears

If the intervals are sorted by start and you're looking at `[c, d]` after a block `[a, b]`, then `a <= c` is already true. And because `c <= d`, `a <= d` is also true. So the whole overlap test shrinks to:

```text
c <= b       (the next start is no later than the current block's end)
```

There's a second payoff. If `c > b`, every later interval starts at `c` or later, so nothing later can reach back into `[a, b]`. That block is **finished**. This is why one left-to-right sweep is enough.

### Merging

Merging two overlapping intervals gives `[min(a, c), max(b, d)]`. After sorting, the `min` is always the block's own start, so you only update the end: `b = max(b, d)`. The `max` matters when one interval sits inside another. `[1, 10]` followed by `[2, 3]` must stay `[1, 10]`.

## The templates

### 1. Merge everything: sort, then sweep

*Merge Intervals*. Use it when the input is unsorted and you need the union.

```python
intervals.sort(key=lambda iv: iv[0])
merged = []
for start, end in intervals:
    if merged and start <= merged[-1][1]:      # overlaps the current block
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])            # a gap: the old block is final
```

### 2. Insert into a sorted list: three phases

*Insert Interval*. Use it when the list is already sorted and non-overlapping, so you don't need to sort again. Relative to the new interval, the old ones come in three runs, in order: before, overlapping, after.

```python
result, i = [], 0
start, end = new
while i < n and intervals[i][1] < start:       # entirely before
    result.append(intervals[i]); i += 1
while i < n and intervals[i][0] <= end:        # overlapping: absorb
    start = min(start, intervals[i][0])
    end = max(end, intervals[i][1]); i += 1
result.append([start, end])
result.extend(intervals[i:])                   # entirely after
```

### 3. Count overlaps at once: sweep the events

You've already met this in the Heaps & Greedy stage, in *Meeting Rooms II*. Split each interval into a start event (+1) and an end event (−1), sort the events, and track the running total. It answers "how many overlap at the busiest moment?" rather than "what's the union?".

## How to recognise this pattern

- The input is a list of `[start, end]` pairs: meetings, bookings, ranges, segments.
- The question uses words like **merge**, **overlap**, **conflict**, **free time**, **cover**, **minimum rooms** or **remove the fewest to make non-overlapping**.
- A brute force compares every pair of intervals.
- The input is "sorted by start" (a strong hint to skip sorting and sweep in O(n)).

## The mistakes everyone makes

1. **`<` vs `<=`.** Decide whether touching counts before you write a single comparison.
2. **`end = d` instead of `end = max(end, d)`.** Nested intervals shrink your block.
3. **Sorting by end.** For merging, sort by start. (Some greedy interval problems do sort by end. Know which question you're answering.)
4. **Comparing with the previous interval instead of the current block.** The block's end can come from an interval several steps back.
5. **Re-sorting an already sorted input.** It's correct, but it costs O(n log n) when O(n) was on offer, and interviewers notice.
6. **Editing the input list while looping over it.** Build a fresh result list.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Merge Intervals | The overlap condition, sort by start, and the `max` for nested intervals |
| Insert Interval | Using sortedness: three phases in one O(n) pass, and getting `<` vs `<=` right |

## You made it

This is the end of the main track. Take a moment with that. You started with loops and hash maps, and you've now worked through two pointers, stacks, binary search, linked lists, trees, heaps, greedy, backtracking, graphs and dynamic programming. More importantly, you've practised **thinking** your way to a solution instead of memorising one, and that's the skill interviews actually test.

If you want to keep going, the bonus track is waiting. It covers tries, union-find, bit tricks, weighted graphs and the hardest problems we held back from the main path. They're tougher, but you're ready for them now. Revisit any stage that felt shaky, keep your streak alive, and go get that offer.
