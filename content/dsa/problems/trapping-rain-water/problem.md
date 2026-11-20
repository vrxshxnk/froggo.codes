---
id: lc-42
title: Trapping Rain Water
pattern: Two pointers with running maxes
timeBox: 40
summary: Given bar heights, compute how much rain water is trapped between the bars after it rains.
hints:
  - "Look at one bar at a time. How high does the water stand above bar i? It depends on the tallest bar to its left and the tallest bar to its right."
  - "Water above bar i = min(tallest on the left, tallest on the right) − height[i]. Precomputing both maxes with two arrays gives O(n) time, O(n) space."
  - "Put a pointer at each end. Whichever side has the shorter current bar, its water level is already decided by its own running max, because the other side has a wall at least that tall. Settle that bar and move that pointer inward."
insight: Water above a bar is min(max to its left, max to its right) − its height. With two pointers, the side with the smaller wall is always the limiting side, so you can settle its bar using only that side's running max. One pass, O(1) space.
time: O(n)
space: O(1)
related: [lc-11, lc-238, lc-84]
---

## The problem in plain English

You get an array `height` of non-negative integers. Each one is a bar of width 1, and the bars stand side by side. Rain falls. Water collects in the dips between bars and spills off both open ends. Return the total number of units of water trapped.

Up to 2 × 10⁴ bars, each 0 to 10⁵ tall.

Example: `height = [4, 2, 0, 3, 2, 5]` → `9`. The water above each bar is `[0, 2, 4, 1, 2, 0]`.

## Start with brute force

For each bar `i`, scan left for the tallest bar and scan right for the tallest bar. The water above `i` is `min(leftMax, rightMax) − height[i]` (it can't be negative, because the maxes include bar `i` itself).

That's O(n) work per bar, so O(n²) total. For `n = 2 × 10⁴` that's 4 × 10⁸ steps. It might scrape through, but it's clearly wasteful: the same maxes get recomputed over and over.

## Building the intuition

This Hard is two Medium ideas stacked together: **prefix/suffix scans** (*Product of Array Except Self*) and **two pointers that move the weaker side** (*Container With Most Water*).

**Step 1: the formula for one bar.** Stand on bar `i`. Water fills up until it would spill over the lower of the two walls around you. The walls are the tallest bar to your left and the tallest to your right. So:

```text
water[i] = min(leftMax[i], rightMax[i]) − height[i]
```

**Step 2: stop recomputing the maxes.** `leftMax[i]` is a running max from the left, and `rightMax[i]` is a running max from the right. Two passes fill two arrays. A third pass adds up the water. That's **O(n) time, O(n) space**, and it's a perfectly good answer to give first.

**Step 3: do you really need both arrays?** For bar `i`, you only care about the **smaller** of the two maxes. Suppose a pointer `left` walks in from the left end and `right` walks in from the right end, each tracking its own running max.

Now say `height[left] < height[right]`. Then `leftMax` (the tallest bar from 0 to `left`) is the true left wall of bar `left`. What about its right wall? You haven't seen everything to its right yet. But you *have* seen `height[right]`, which is taller than `height[left]`. Here's the crucial part: all the pointer moves so far happened because the side being moved was the shorter one, so `leftMax` never got bigger than the tallest bar on the right side. That means the right wall of bar `left` is at least `leftMax`.

So `min(leftMax, trueRightMax) = leftMax`. You can settle bar `left` right now, without knowing the rest. Mirror that when the right side is shorter.

That's the same move as in *Container With Most Water*: **the shorter side is the bottleneck, so it's the one you can decide.**

## The optimal approach

1. `left = 0`, `right = n − 1`, `leftMax = rightMax = 0`, `water = 0`.
2. While `left < right`:
   - if `height[left] < height[right]`: update `leftMax = max(leftMax, height[left])`, add `leftMax − height[left]`, then `left += 1`;
   - else: update `rightMax = max(rightMax, height[right])`, add `rightMax − height[right]`, then `right −= 1`.
3. Return `water`.

**The subtle detail: update the max before adding.** Including the current bar in the max first means the added amount is never negative. If the bar is a new maximum, it adds `0`, which is right, because a new tallest wall holds no water above itself.

{{code}}

## Dry run

`height = [4, 2, 0, 3, 2, 5]`.

| left | right | `h[left]` vs `h[right]` | Side moved | leftMax | rightMax | Added | water |
|---|---|---|---|---|---|---|---|
| 0 | 5 | 4 < 5 | left | 4 | 0 | 0 | 0 |
| 1 | 5 | 2 < 5 | left | 4 | 0 | 2 | 2 |
| 2 | 5 | 0 < 5 | left | 4 | 0 | 4 | 6 |
| 3 | 5 | 3 < 5 | left | 4 | 0 | 1 | 7 |
| 4 | 5 | 2 < 5 | left | 4 | 0 | 2 | **9** |
| 5 | 5 | stop | — | — | — | — | 9 |

The right wall (5) was never moved, because it was never the shorter side. Each left bar was settled using only `leftMax = 4`.

## Complexity

- **Time: O(n).** Each step moves one pointer inward by one, so there are `n − 1` steps.
- **Space: O(1).** Four integers. Compare that with the two O(n) max arrays from step 2.

## Edge cases and traps

- **Fewer than three bars.** `[1]` or `[2, 0]` → 0. The loop handles it: you need a wall on both sides to hold water.
- **Monotone input.** `[1, 2, 3, 4, 5]` or `[5, 4, 3, 2, 1]` → 0. Each bar is a new running max on its side and adds nothing.
- **Moving the taller side.** If you move the side with the *taller* bar, you'd settle a bar using a max that isn't its real bottleneck. That gives wrong answers on inputs like `[5, 0, 1]`.
- **Using `<=` vs `<`.** With equal heights either side can move. Both are correct. Just be consistent.
- **Overflow.** At most 2 × 10⁴ bars × 10⁵ depth = 2 × 10⁹, which is right at the edge of a 32-bit `int` (max about 2.147 × 10⁹). Real inputs can't reach that, because the bars themselves take up space, but keep it in mind if the limits change.

## Say it in the interview

> "Water above a bar is the smaller of the tallest bar to its left and to its right, minus its own height. Precomputing both maxes is O(n) time and O(n) space. To get O(1) space, I use two pointers from the ends, each tracking its running max. Whichever side has the shorter bar is the bottleneck, because the other side already has a wall at least as tall. So I can settle that bar with its own side's max and move inward. One pass, O(n) time, O(1) space."

## Follow-ups interviewers ask

- **"Can you do it with a stack?"** Yes. Use a monotonic decreasing stack, like *Largest Rectangle in Histogram*. When a taller bar arrives, pop the bottom of a dip and add the water layer bounded by the new stack top and the incoming bar: `(min(walls) − bottom) × width`. Also O(n), but it fills water in horizontal layers instead of per column.
- **"Trapping Rain Water II: a 2-D height map."** (LeetCode 407.) The boundary becomes a ring of cells. Use a min-heap of boundary cells and always expand from the lowest one, the same "shorter wall decides" idea, now with a heap: O(R·C log(R·C)).
- **"What if the bars have different widths?"** The same two-pointer scan works. Just multiply each column's water depth by its width.
