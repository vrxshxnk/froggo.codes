---
id: lc-11
title: Container With Most Water
pattern: Two pointers, drop the shorter
timeBox: 25
summary: Pick two vertical lines so that, together with the floor, they hold the most water, and return that amount.
hints:
  - "The water between lines i and j is min(height[i], height[j]) × (j − i). Start with the widest container. Which of its two walls is holding it back?"
  - "If you keep the shorter wall and move the other wall inwards, the width shrinks and the height still can't go above the shorter wall. So that can never help."
  - "Put pointers at both ends. Record the area, then move the pointer on the shorter wall inwards. Repeat until they meet."
insight: The shorter wall caps the water. Pairing it with any closer wall gives less width and no more height, so the shorter wall is finished. Drop it and move inwards. Each step retires one wall for good.
time: O(n)
space: O(1)
related: [lc-167, lc-42, lc-15]
---

## The problem in plain English

You get an array `height`. Picture `height[i]` as a vertical line standing at position `i` on the x-axis. Choose two lines. Together with the floor they form a container, and the water level can only rise as high as the **shorter** of the two lines. Return the largest amount of water any pair can hold.

The water between lines `i < j` is `min(height[i], height[j]) × (j − i)`. That's height times width. You can't tilt the container.

Constraints that matter: 2 to 10⁵ lines, each between 0 and 10⁴ tall. The answer is at most 10⁴ × 10⁵ = 10⁹, which fits in a 32-bit int.

Example: `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49`. The lines at index 1 (height 8) and index 8 (height 7) are 7 apart, and `min(8, 7) × 7 = 49`.

## Start with brute force

Try every pair `i < j`, compute the area, and keep the maximum. It's obviously correct. With n = 10⁵ that's about n²/2 = 5·10⁹ pairs, which is far too slow. We need to throw away most pairs without checking them.

## Building the intuition

Start with the widest container possible: `left = 0`, `right = n − 1`. Any other container is narrower, so to beat this one it must be **taller**.

Look at the example: `height[0] = 1` and `height[8] = 7`. The area is `min(1, 7) × 8 = 8`.

Now ask the key question: **is there any point keeping the line at index 0?** Every other partner for it is closer, so the width drops. And the water height is `min(1, partner)`, which is never more than 1. So every container that uses line 0 holds at most 8 water. We've just checked line 0's best possible container. **Line 0 is finished.** Move `left` inwards.

That argument works every time, for whichever line is shorter. The shorter wall has already seen its best container (the widest one it can still make), so you can retire it. The taller wall might still find a taller partner further in, so you keep it.

This is the same "rule one end out" move as *Two Sum II*. There, the sum told you which end to drop. Here, the shorter height does.

## The optimal approach

1. Set `left = 0`, `right = n − 1`, `best = 0`.
2. While `left < right`:
   - `area = min(height[left], height[right]) × (right − left)`, and update `best`;
   - if `height[left] < height[right]`, do `left += 1`; otherwise do `right -= 1`.
3. Return `best`.

**The subtle detail: what if the two heights are equal?** Move either one. Say both are 8. Any container that keeps one of them and pairs it with a wall further in is narrower, and still capped at 8. So neither 8 can do better with anything in between. That's why it's safe to drop one, and the code simply drops `right`.

{{code}}

## Dry run

`height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`

| left | right | Heights | Area | best | Move |
|---|---|---|---|---|---|
| 0 | 8 | 1, 7 | 1 × 8 = 8 | 8 | 1 is shorter, left → 1 |
| 1 | 8 | 8, 7 | 7 × 7 = 49 | **49** | 7 is shorter, right → 7 |
| 1 | 7 | 8, 3 | 3 × 6 = 18 | 49 | right → 6 |
| 1 | 6 | 8, 8 | 8 × 5 = 40 | 49 | equal, right → 5 |
| 1 | 5 | 8, 4 | 4 × 4 = 16 | 49 | right → 4 |
| 1 | 4 | 8, 5 | 5 × 3 = 15 | 49 | right → 3 |
| 1 | 3 | 8, 2 | 2 × 2 = 4 | 49 | right → 2 |
| 1 | 2 | 8, 6 | 6 × 1 = 6 | 49 | right → 1, the pointers meet |

Eight areas checked instead of 36 pairs.

## Complexity

- **Time: O(n).** Each step moves one pointer inwards, so there are n − 1 steps.
- **Space: O(1).** Two pointers and a running best.

## Edge cases and traps

- **Moving the taller wall.** This is the classic bug. It can skip the answer. Always move the **shorter** one.
- **Using the taller height in the area.** The water spills over the shorter wall, so use `min`.
- **Width off by one.** The width is `right − left`, not `right − left + 1`. Two lines next to each other are 1 apart.
- **Zero heights.** `[0, 0, 0]` → `0`. Nothing special is needed.
- **Confusing it with Trapping Rain Water.** That problem counts water above *every* bar. This one picks just two lines, and the bars in between don't block anything.

## Say it in the interview

> "Brute force tries every pair, which is O(n²). Instead I start with the widest container, using one pointer at each end. The water is capped by the shorter wall, and if I pair that wall with anything closer, the width shrinks and the height can't go up. So the shorter wall has already seen its best container, and I can drop it and move that pointer inwards. I track the best area as I go. Each step retires one wall, so it's O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"Prove you never skip the best pair."** Say the best pair is `(a, b)`. Some step first moves a pointer off `a` or off `b`. Say it moves off `a`, while the other pointer is at some `r` with `r ≥ b`. We only move off the shorter wall, so `height[a] ≤ height[r]`. The area we recorded at that step was `height[a] × (r − a)`. That's at least `min(height[a], height[b]) × (b − a)`, so the best value was already recorded.
- **"What if water fills above every bar?"** That's *Trapping Rain Water*, in the bonus Hard DP & The Gauntlet stage. It also uses two pointers, but each one tracks the tallest bar seen from its side.
- **"Can you skip faster?"** After moving past the shorter wall, you can also skip any wall that isn't taller than it. That's a constant-factor speed-up. It's still O(n).
