---
id: lc-312
title: Burst Balloons
pattern: Interval DP, choose the last one
timeBox: 40
summary: Burst balloons in the best order, where each burst pays the product of the balloon and its current neighbours, and find the most coins you can collect.
hints:
  - "Choosing which balloon to burst FIRST is a dead end: once it's gone, its two neighbours become adjacent, and the two sides of the row stop being independent."
  - "Flip it. Pick which balloon in a range is burst LAST. Until then it is still standing, so it acts as a wall that keeps the left part and the right part separate."
  - "Pad the row with 1 at both ends. Let dp[l][r] = best coins from bursting everything strictly between l and r, with l and r still standing. Then dp[l][r] = max over k in (l, r) of dp[l][k] + vals[l]·vals[k]·vals[r] + dp[k][r]. Fill short gaps before long ones."
insight: Think about the last balloon burst in a range, not the first. While it stands, it splits the range into two independent halves, and when it finally bursts, its neighbours are exactly the range's two fixed ends. That gives an interval DP over (l, r) in O(n³).
time: O(n³)
space: O(n²)
related: [lc-5, lc-72, lc-1143]
---

## The problem in plain English

There are `n` balloons in a row, and balloon `i` has the number `nums[i]` painted on it. You burst them one at a time, in any order you like. Bursting balloon `i` pays `left × nums[i] × right` coins, where `left` and `right` are the numbers on the balloons **currently** next to it. Once a balloon is gone, its neighbours become neighbours of each other. If there's no balloon on a side, treat that side as a `1`.

Burst them all and return the **maximum** coins possible. `n` is at most 300, and each number is 0 to 100.

Example: `nums = [3, 1, 5, 8]` → `167`. One best order is to burst 1, then 5, then 3, then 8:

```text
[3, 1, 5, 8]  burst 1 → 3·1·5 = 15
[3, 5, 8]     burst 5 → 3·5·8 = 120
[3, 8]        burst 3 → 1·3·8 = 24
[8]           burst 8 → 1·8·1 = 8         total 167
```

## Start with brute force

Try every order. There are `n!` orders. For `n = 10`, that's 3.6 million. For `n = 300`, it's beyond astronomical.

You could memoise on the **set** of balloons still standing: that's 2ⁿ states. That handles `n = 20` at most. We need a state that's much smaller than a set.

## Building the intuition

This is the stage's **interval DP** problem. Interval DP means the state is a contiguous range `[l, r]`, and you solve a range by splitting it at some point `k` into two smaller ranges. The hard part here is finding a split that actually makes the two halves independent.

**Attempt 1: choose the first balloon to burst.** Say you burst `k` first in the range. Now `k−1` and `k+1` are neighbours. The left part and the right part touch each other, and every later burst near the middle depends on what's left on *both* sides. The two halves aren't independent. That's a dead end.

**Attempt 2: choose the last balloon to burst.** Now ask: in the range `(l, r)`, which balloon `k` goes **last**? Think about what that means.

- Until the very end, `k` is still standing. Every balloon between `l` and `k` gets burst while `k` is a wall on its right. Every balloon between `k` and `r` gets burst while `k` is a wall on its left. **The two sides never see each other.** They're independent subproblems.
- When `k` finally bursts, everything else in the range is already gone. So its neighbours are exactly `l` and `r`, the range's ends. It pays `vals[l] · vals[k] · vals[r]`.

So:

```text
dp[l][r] = max over l < k < r of  dp[l][k] + vals[l]·vals[k]·vals[r] + dp[k][r]
```

where `dp[l][r]` means "the best coins from bursting every balloon **strictly between** `l` and `r`, while `l` and `r` are still standing".

**Why the padding?** Put a `1` at each end: `vals = [1] + nums + [1]`. Those two fake balloons are never burst. They're exactly the "treat a missing side as 1" rule. The answer is `dp[0][n+1]`: burst everything between the two fake ends.

**The base case** is free: if `r = l + 1`, there's nothing between them, so `dp[l][r] = 0`.

## The optimal approach

1. `vals = [1] + nums + [1]`, and let `N = len(vals)`.
2. `dp` is an `N × N` table of zeros.
3. For `length` (that is, `r − l`) from 2 up to `N − 1`, and for each `l` with `r = l + length` inside the array:
   - `dp[l][r] = max(dp[l][k] + vals[l]·vals[k]·vals[r] + dp[k][r])` over `l < k < r`.
4. Return `dp[0][N − 1]`.

**The subtle detail: fill order.** `dp[l][r]` reads `dp[l][k]` and `dp[k][r]`, which are both **shorter** ranges. So loop by gap length, short to long. If you loop `l` from 0 upward with `r` inside, you'll read cells that haven't been computed yet. (Looping `l` from right to left and `r` from left to right also works.)

{{code}}

## Dry run

`nums = [3, 1, 5, 8]` → `vals = [1, 3, 1, 5, 8, 1]` (indices 0–5). Each row shows the best "last balloon" `k` for that range.

| Range (l, r) | Balloons inside | Best k (value) | Calculation | dp[l][r] |
|---|---|---|---|---|
| (0, 2) | 3 | 1 (3) | 0 + 1·3·1 + 0 | 3 |
| (1, 3) | 1 | 2 (1) | 0 + 3·1·5 + 0 | 15 |
| (2, 4) | 5 | 3 (5) | 0 + 1·5·8 + 0 | 40 |
| (3, 5) | 8 | 4 (8) | 0 + 5·8·1 + 0 | 40 |
| (0, 3) | 3, 1 | 1 (3) | 0 + 1·3·5 + dp[1][3] = 15 + 15 | 30 |
| (1, 4) | 1, 5 | 3 (5) | dp[1][3] + 3·5·8 + 0 = 15 + 120 | 135 |
| (2, 5) | 5, 8 | 4 (8) | dp[2][4] + 1·8·1 + 0 = 40 + 8 | 48 |
| (0, 4) | 3, 1, 5 | 1 (3) | 0 + 1·3·8 + dp[1][4] = 24 + 135 | 159 |
| (1, 5) | 1, 5, 8 | 4 (8) | dp[1][4] + 3·8·1 + 0 = 135 + 24 | 159 |
| (0, 5) | all | 4 (8) | dp[0][4] + 1·8·1 + 0 = 159 + 8 | **167** |

Read the answer backwards: 8 goes last overall. Before that, in `(0, 4)`, 3 goes last. Inside `(1, 4)`, 5 goes last, and inside `(1, 3)`, 1 goes first. That's the order `1, 5, 3, 8` from the example.

## Complexity

- **Time: O(n³).** There are O(n²) ranges, and each one tries O(n) choices of `k`. For `n = 300`, that's about 4.5 × 10⁶ inner steps, which is fast.
- **Space: O(n²)** for the table.

## Edge cases and traps

- **Thinking "first" instead of "last".** This is the whole problem. If your recurrence picks the first balloon, the subproblems overlap through changing neighbours, and the DP is wrong.
- **Forgetting the padding.** Without the 1s, the ends need special cases everywhere. Pad once and the formula works for every range.
- **Wrong fill order.** Iterate by gap length, or by `l` descending with `r` ascending. Plain `for l: for r:` reads uncomputed cells.
- **Zeros.** A `0` balloon pays nothing itself, and makes its neighbours' bursts pay nothing while it stands next to them. The DP handles it. `[0, 0, 0]` → 0.
- **Overflow.** The worst case is about 300 bursts × 100³ = 3 × 10⁸, which fits in an `int`.

## Say it in the interview

> "Bursting changes who's adjacent, so choosing the first balloon couples the two sides. Instead I choose the last balloon k in a range. While k stands, the left and right parts are independent, and when it bursts, its neighbours are the range's fixed ends. I pad with 1s and define dp[l][r] as the best coins for everything strictly between l and r. That's the max over k of dp[l][k] plus vals[l]·vals[k]·vals[r] plus dp[k][r]. I fill by increasing range length. There are O(n²) states with O(n) transitions each, so O(n³) time and O(n²) space."

## Follow-ups interviewers ask

- **"Which other problems are interval DP?"** *Minimum Cost Tree From Leaf Values*, *Minimum Score Triangulation of Polygon*, *Strange Printer*, *Remove Boxes*, and matrix-chain multiplication. The `isPal[i][j]` table version of *Longest Palindromic Substring* is a simpler cousin: its state is a range too, but it doesn't split. The tell: **a range, and a choice that splits it into two independent ranges.**
- **"Recover the order of bursts."** Store the best `k` for each `(l, r)`. Then recurse: build the order for `(l, k)`, then for `(k, r)`, then burst `k` last.
- **"Top-down instead?"** Write `best(l, r)` with memoisation and the same recurrence. It's often easier to get right in an interview, and it has the same O(n³).
