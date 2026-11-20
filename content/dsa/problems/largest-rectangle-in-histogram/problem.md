---
id: lc-84
title: Largest Rectangle in Histogram
pattern: Monotonic stack, nearest smaller
timeBox: 40
summary: Given bar heights of a histogram, find the area of the largest rectangle that fits inside it.
hints:
  - "Flip the question. Every rectangle has a shortest bar that limits its height. For each bar, how wide could a rectangle be if this bar is the shortest one in it?"
  - "Bar i can stretch left and right until it hits a strictly shorter bar on each side. So you need the nearest smaller bar to the left and to the right of every bar."
  - "Keep a stack of indices with increasing heights. When a shorter bar arrives, pop: the incoming bar is the popped bar's right boundary, and the new top of the stack is its left boundary. Add a height-0 bar at the end to flush the stack."
insight: The best rectangle is limited by its shortest bar. So for every bar, compute the widest stretch where it is the minimum. Its boundaries are the nearest smaller bars on each side, and one monotonic stack finds both in a single pass.
time: O(n)
space: O(n)
related: [lc-739, lc-42, lc-155]
---

## The problem in plain English

You get an array `heights`. Each entry is a bar of width 1 in a histogram. Find the area of the largest rectangle that fits **entirely inside** the bars. The rectangle must sit on the ground and can span several neighbouring bars, but it can't be taller than any bar it covers.

Up to 10⁵ bars, each 0 to 10⁴ tall.

Example: `heights = [2, 1, 5, 6, 2, 3]` → `10`. The rectangle covers the bars `5` and `6` (indices 2 and 3) at height 5: `5 × 2 = 10`.

## Start with brute force

Try every pair `(i, j)`. The tallest rectangle spanning bars `i..j` is as tall as the shortest bar between them. If you keep a running minimum while `j` moves right, each pair is O(1):

```python
for i in range(n):
    low = inf
    for j in range(i, n):
        low = min(low, heights[j])
        best = max(best, low * (j - i + 1))
```

That's O(n²). For `n = 10⁵`, that's 5 × 10⁹ steps. Too slow.

## Building the intuition

This Hard is two Medium ideas stacked together: **"fix the bottleneck"** (enumerate by the thing that limits the answer) and **"nearest smaller element with a monotonic stack"** from *Daily Temperatures*.

**Step 1: enumerate by the shortest bar.** The brute force enumerates rectangles by their two ends. Turn it around. Every rectangle has a **shortest bar**, and that bar fixes the height. So ask, for each bar `i`: *if bar `i` is the shortest bar in my rectangle, how wide can I go?*

Answer: spread left and right until you hit a bar **shorter** than `heights[i]`. Let `L` be the index of the nearest shorter bar on the left, and `R` the nearest shorter bar on the right. The rectangle spans `L + 1 .. R − 1`, so its width is `R − L − 1`.

Check bar 2 (height 5) in `[2, 1, 5, 6, 2, 3]`: the nearest shorter bar on the left is index 1 (height 1), and on the right it's index 4 (height 2). Width `4 − 1 − 1 = 2`, area `5 × 2 = 10`. That's the answer.

So the problem becomes: **find the nearest smaller bar on both sides of every bar.** That's n "next smaller element" queries.

**Step 2: why a stack?** In *Daily Temperatures*, you found the next *warmer* day with a stack of days still waiting for an answer. Same idea here, mirrored. Keep a stack of bar indices whose heights **increase** from bottom to top. These are bars still waiting for their right boundary.

When bar `i` arrives and it is shorter than (or equal to) the top of the stack, the top has just found its right boundary: it's `i`. Pop it. And its left boundary? The stack is increasing, so the element just below it is the nearest bar to its left that's shorter. Both boundaries in one pop.

**Step 3: flushing.** Bars still on the stack at the end never met a shorter bar. Pretend there's a bar of height 0 at index `n`. It's shorter than everything, so it pops them all, with `R = n`.

## The optimal approach

1. Make an empty stack of indices. Loop `i` from `0` to `n` inclusive, where `h = heights[i]`, or `0` when `i == n`.
2. While the stack isn't empty and `heights[top] >= h`:
   - pop `top`;
   - `left` = the new stack top, or `−1` if the stack is empty;
   - the area is `heights[top] × (i − left − 1)`. Keep the maximum.
3. Push `i`.
4. Return the maximum.

**The subtle detail: equal heights.** We pop on `>=`, not just `>`. With `[5, 5, 5, 5]`, the first three bars get popped by an *equal* bar, so their width is undercounted. That's fine. The **last** bar of the run is popped by the sentinel 0, and by then the stack below it is empty, so it gets the full width 4 and area 20. Any run of equal bars ends with one pop that measures the whole run. So you never miss the best rectangle.

{{code}}

## Dry run

`heights = [2, 1, 5, 6, 2, 3]`. The stack shows indices, with heights in brackets.

| i | h | Pops (top → left boundary, width, area) | Stack after push | Best |
|---|---|---|---|---|
| 0 | 2 | — | `0[2]` | 0 |
| 1 | 1 | pop 0: left −1, width 1, area 2 | `1[1]` | 2 |
| 2 | 5 | — | `1[1] 2[5]` | 2 |
| 3 | 6 | — | `1[1] 2[5] 3[6]` | 2 |
| 4 | 2 | pop 3: left 2, width 1, area 6. Pop 2: left 1, width 2, area **10** | `1[1] 4[2]` | 10 |
| 5 | 3 | — | `1[1] 4[2] 5[3]` | 10 |
| 6 | 0 | pop 5: width 1, area 3. Pop 4: left 1, width 4, area 8. Pop 1: left −1, width 6, area 6 | `6[0]` | **10** |

## Complexity

- **Time: O(n).** Each index is pushed once and popped at most once. The inner `while` does at most `n` pops across the whole loop.
- **Space: O(n).** On a strictly increasing input, every bar sits on the stack at once.

## Edge cases and traps

- **Forgetting the flush.** Without the height-0 bar at the end, an increasing input like `[1, 2, 3, 4, 5]` never pops anything, and you return 0. The answer is 9.
- **Width off by one.** The width is `i − left − 1`, where both `i` and `left` are *exclusive* boundaries. If the stack is empty, use `left = −1`, so the width becomes `i`.
- **Pushing heights instead of indices.** You need the positions to compute widths. Push indices and look the heights up.
- **Zero-height bars.** `[0, 0, 0]` → 0. A zero bar pops everything before it and acts as a wall. That's correct.
- **Overflow.** The maximum area is 10⁵ × 10⁴ = 10⁹, which fits in a 32-bit `int`. That's tight, though. On other versions with bigger limits, use 64-bit.

## Say it in the interview

> "Every rectangle is limited by its shortest bar. So for each bar I ask: how wide can a rectangle be if this bar is the minimum? It stretches until the nearest strictly shorter bar on each side. I find both boundaries with a monotonic increasing stack of indices. When a shorter bar arrives, I pop. The arriving bar is the popped bar's right boundary, and the new stack top is its left boundary. A sentinel 0 at the end flushes the stack. Each bar is pushed and popped once, so it's O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"Largest rectangle of 1s in a binary matrix."** (LeetCode 85, *Maximal Rectangle*.) Treat each row as the ground of a histogram, where a column's height is the number of consecutive 1s ending at that row. Run this algorithm once per row: O(rows × cols).
- **"Can you do it with two passes instead of one?"** Yes. Compute `leftSmaller[i]` with one stack pass, `rightSmaller[i]` with another, then take the max of `heights[i] × (right − left − 1)`. It's easier to reason about and has the same O(n).
- **"Divide and conquer?"** Split at the minimum bar: the best rectangle either uses the whole range at the minimum height, or lies entirely on one side. That's O(n log n) on average and O(n²) on sorted input, unless you find each minimum with a segment tree.
