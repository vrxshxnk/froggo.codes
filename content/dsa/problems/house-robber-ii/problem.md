---
id: lc-213
title: House Robber II
pattern: Break the circle, reuse 1D DP
timeBox: 25
summary: Same as House Robber, but the houses stand in a circle, so the first and last houses are neighbours too.
hints:
  - "If the street were a straight line, you'd already know how to solve it. What's the only new rule the circle adds?"
  - "The circle only adds one forbidden pair: the first house and the last house. In any valid plan, at least one of them is left alone."
  - "Solve the straight-line House Robber twice: once on houses 0 to n − 2 (last house left out), once on houses 1 to n − 1 (first house left out). Return the larger. Handle n = 1 separately."
insight: In a circle, the first and last houses can't both be robbed, so the best plan either ignores the first house or ignores the last. Each of those is a straight street, which is plain House Robber.
time: O(n)
space: O(1)
related: [lc-198, lc-70]
---

## The problem in plain English

This is *House Robber* with one twist. `nums[i]` is still the money in house `i`, and you still can't rob two neighbours. But now the houses form a **circle**: house 0 and house `n − 1` are neighbours as well. Return the largest total you can take.

There are 1 to 100 houses, each holding 0 to 1000.

Example: `nums = [2, 3, 2]` → `3`. On a straight street you'd rob both 2s for 4, but they're neighbours in the circle, so the best is the single 3.

## Start with brute force

Try every set of houses, reject any set with two neighbours (counting the pair 0 and `n − 1`), and keep the best total. That's 2ⁿ sets, about 10³⁰ for `n = 100`.

You could also try to bolt a "did I rob house 0?" flag onto the old DP. It works, but there's a simpler idea that reuses what you already know.

## Building the intuition

Start from what you know. In *House Robber*, `dp[i]` was the best total from the first `i` houses, and `dp[i] = max(dp[i − 1], dp[i − 2] + money)`. That works on any straight line of houses.

What does the circle break? Only one thing: on a straight line the first and last houses aren't neighbours, so a plan could rob both. In the circle it can't.

Now think about any valid plan in the circle. The first and last houses can't both be robbed. So **at least one of them is left alone**:

- **Case A: the last house is left alone.** Then you might as well delete it. The rest, houses `0 … n − 2`, is a straight line. Its first and last houses aren't neighbours any more.
- **Case B: the first house is left alone.** Delete it. Houses `1 … n − 1` are a straight line.

Every valid circle plan fits in A or B (or both), and every straight-line plan for A or B is a valid circle plan. So the answer is `max(best(A), best(B))`. Two straight-line problems, and you already have the solution.

The recipe for each run is the same as before:

1. **State.** `dp[i]` means *the most money from the first `i` houses of this range*.
2. **Recurrence.** `dp[i] = max(dp[i − 1], dp[i − 2] + money)`: skip this house, or rob it.
3. **Base cases.** `dp[0] = 0`, and the "two back" value starts at 0.
4. **Order.** Left to right. Each cell reads only the two before it, so keep **two variables**, `prev2 = dp[i − 2]` and `prev1 = dp[i − 1]`, instead of a table. That's the space optimisation from *House Robber*.

## The optimal approach

1. If there's one house, return `nums[0]`. (Both ranges below would be empty.)
2. Write `robLine(lo, hi)`: plain House Robber on `nums[lo..hi]`.
   - Start with `prev2 = 0`, `prev1 = 0`.
   - For each house `k` from `lo` to `hi`: `cur = max(prev1, prev2 + nums[k])`, then shift `prev2 = prev1`, `prev1 = cur`.
   - Return `prev1`.
3. Return `max(robLine(0, n − 2), robLine(1, n − 1))`.

**The subtle detail: the single house.** With `n = 1` the ranges are `0..−1` and `1..0`, both empty, so both runs return 0. But one house has no neighbour at all, and you should rob it. That's why step 1 exists.

{{code}}

## Dry run

`nums = [200, 3, 140, 20, 10]`. On a straight street the best would be `200 + 140 + 10 = 350`, but that robs both house 0 and house 4, which touch in the circle.

**Run A: houses 0 to 3** (`[200, 3, 140, 20]`, last house left out)

| k | nums[k] | prev2 = dp[i − 2] | prev1 = dp[i − 1] | cur = max(prev1, prev2 + nums[k]) |
|---|---|---|---|---|
| 0 | 200 | 0 | 0 | max(0, 200) = **200** |
| 1 | 3 | 0 | 200 | max(200, 3) = **200** |
| 2 | 140 | 200 | 200 | max(200, 340) = **340** |
| 3 | 20 | 200 | 340 | max(340, 220) = **340** |

The `cur` column is the DP table for run A: `dp = [0, 200, 200, 340, 340]`. Best: 340.

**Run B: houses 1 to 4** (`[3, 140, 20, 10]`, first house left out)

| k | nums[k] | prev2 = dp[i − 2] | prev1 = dp[i − 1] | cur = max(prev1, prev2 + nums[k]) |
|---|---|---|---|---|
| 1 | 3 | 0 | 0 | max(0, 3) = **3** |
| 2 | 140 | 0 | 3 | max(3, 140) = **140** |
| 3 | 20 | 3 | 140 | max(140, 23) = **140** |
| 4 | 10 | 140 | 140 | max(140, 150) = **150** |

Table for run B: `dp = [0, 3, 140, 140, 150]`. Best: 150.

Answer: `max(340, 150) = 340` (houses 0 and 2).

## Complexity

- **Time: O(n).** Two linear passes.
- **Space: O(1).** Each pass keeps two variables. (With full tables it would be O(n).)

## Edge cases and traps

- **One house.** Return it directly. Without the special case you return 0.
- **Two houses.** They're neighbours, so the answer is the larger one. The two runs each see a single house and handle this correctly.
- **Running House Robber once on the whole array.** It may rob both ends, as in the dry run (350 instead of 340).
- **Excluding both ends in one run.** `robLine(1, n − 2)` misses plans that rob house 0 or house `n − 1`. You need two separate runs, each excluding only one end.
- **Updating `prev2` and `prev1` in the wrong order.** Compute `cur` first, then shift. Overwriting `prev1` before using it loses `dp[i − 1]`.

## Say it in the interview

> "The circle only adds one rule: the first and last houses can't both be robbed. So any valid plan skips at least one of them. I solve the straight-line House Robber twice, once on houses 0 to n − 2 and once on 1 to n − 1, and take the max. Each run is the two-variable DP, `cur = max(prev1, prev2 + nums[k])`. That's O(n) time and O(1) space. One house is a special case: I just return it."

## Follow-ups interviewers ask

- **"Why is it safe to delete a house instead of forcing it to be skipped?"** Skipping a house and deleting it give the same set of choices for everyone else, and deleting it also removes its edge to the far end.
- **"What if the houses form a tree instead?"** That's House Robber III: for each node, compute two values (best if you rob it, best if you don't) from its children, in a post-order DFS.
- **"Can you do it in one pass?"** Yes, by running both two-variable DPs side by side in the same loop. Same complexity; it just saves a second loop.
