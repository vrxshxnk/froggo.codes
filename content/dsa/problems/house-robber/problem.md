---
id: lc-198
title: House Robber
pattern: Take it or skip it DP
timeBox: 25
summary: Pick houses along a street to rob so the total money is as large as possible, without ever picking two houses that are next to each other.
hints:
  - "Greedy rules like 'take every other house' or 'take the richest house first' break on small examples. Try [2, 1, 1, 2]."
  - "Look only at the last house. You either rob it or you don't. What does each choice leave you with?"
  - "Let dp[i] be the best total from the first i houses. Skipping house i leaves dp[i − 1]; robbing it adds its money to dp[i − 2]. Take the larger."
insight: For the last house there are only two choices. Skip it and you keep the best of the houses before it; rob it and you add its money to the best of the houses two back. So dp[i] = max(dp[i − 1], dp[i − 2] + money).
time: O(n)
space: O(n)
related: [lc-70, lc-213, lc-53]
---

## The problem in plain English

Houses stand in a row. `nums[i]` is the money in house `i`. You can rob any set of houses, except that **you can never rob two neighbours** (houses `i` and `i + 1`), because the alarms are linked. Return the **largest total** you can take.

There are 1 to 100 houses, each holding 0 to 400.

Example: `nums = [2, 7, 9, 3, 1]` → `12`. Rob houses 0, 2 and 4: `2 + 9 + 1 = 12`.

## Start with brute force

Try every set of houses. Throw away any set that contains two neighbours, and keep the best total.

With `n` houses there are 2ⁿ sets. For `n = 100` that's about 10³⁰. Hopeless.

Greedy shortcuts don't work either. "Take every other house" fails on `[2, 1, 1, 2]`: the even houses give 3 and the odd houses give 3, but robbing the two ends gives 4. "Take the richest house first" fails on `[3, 4, 3]`: grabbing the 4 blocks both 3s, which together make 6.

## Building the intuition

The brute force makes a choice for *every* house at once. Simplify: make the choice for **one** house, the last one. Say you're deciding about the last house of the first `i`.

- **Skip it.** Then the last house doesn't matter. The best you can do is the best from the first `i − 1` houses.
- **Rob it.** You get its money. Its left neighbour is now off-limits, so the rest must come from the first `i − 2` houses, and you want the best possible total there too.

Both options ask "what's the best from a shorter street?" That's the same question on a smaller input, so it's DP. Walk through the recipe.

1. **State.** `dp[i]` means *the most money you can take from the first `i` houses* (`nums[0]` to `nums[i − 1]`).
2. **Recurrence.** `dp[i] = max(dp[i − 1], dp[i − 2] + nums[i − 1])`. The first term is "skip", the second is "rob".
3. **Base cases.** `dp[0] = 0` (no houses, no money). `dp[1] = nums[0]` (one house: rob it).
4. **Order.** `dp[i]` reads `dp[i − 1]` and `dp[i − 2]`, so fill left to right.

Why "first `i` houses" instead of "up to house `i`"? It gives `dp[0]` a clear meaning (empty street), and the street with one house needs no special case.

## The optimal approach

1. Make `dp` of size `n + 1`. Set `dp[0] = 0`, `dp[1] = nums[0]`.
2. For `i` from 2 to `n`:
   - `skip = dp[i − 1]`
   - `take = dp[i − 2] + nums[i − 1]`
   - `dp[i] = max(skip, take)`
3. Return `dp[n]`.

**The subtle detail: the index shift.** `dp[i]` covers `i` houses, so the house being decided is `nums[i − 1]`, not `nums[i]`. Mixing the two is the most common bug here.

**Space optimisation.** Each cell reads only the two before it, so two variables are enough and space becomes O(1). *House Robber II* uses exactly that version:

```python
prev2, prev1 = 0, 0               # dp[i-2], dp[i-1]
for x in nums:
    prev2, prev1 = prev1, max(prev1, prev2 + x)
return prev1
```

{{code}}

## Dry run

`nums = [2, 7, 9, 3, 1]`

| i | house `nums[i − 1]` | skip = dp[i − 1] | take = dp[i − 2] + house | dp[i] |
|---|---|---|---|---|
| 0 | — | — | — | 0 (base) |
| 1 | 2 | — | — | 2 (base) |
| 2 | 7 | 2 | 0 + 7 = 7 | **7** |
| 3 | 9 | 7 | 2 + 9 = 11 | **11** |
| 4 | 3 | 11 | 7 + 3 = 10 | **11** |
| 5 | 1 | 11 | 11 + 1 = 12 | **12** |

Final table: `dp = [0, 2, 7, 11, 11, 12]`. The answer is `dp[5] = 12`. Trace it back: 12 came from "take" at the last house (the 1) on top of `dp[3] = 11`, which came from "take" at the 9 on top of `dp[1] = 2`. So houses 0, 2, 4.

## Complexity

- **Time: O(n).** One pass, constant work per house.
- **Space: O(n)** for the table, or **O(1)** with the two-variable version.

## Edge cases and traps

- **One house.** `dp[1] = nums[0]` and the loop never runs. Some solutions read `nums[1]` and crash.
- **Zeros.** Houses can hold 0. Nothing breaks, but greedy reasoning about "always rob" does.
- **Thinking `dp[i]` means "house `i` is robbed".** Then the answer isn't `dp[n]`, it's the max over the last two cells, and the recurrence gets messy. "Best from the first `i` houses, robbed or not" is cleaner.
- **Using `nums[i]` instead of `nums[i − 1]`.** Off by one, and it goes out of bounds on the last step.

## Say it in the interview

> "Greedy fails here, for example on `[2, 1, 1, 2]`. Let `dp[i]` be the best total from the first `i` houses. For the last house I either skip it, giving `dp[i − 1]`, or rob it, giving its money plus `dp[i − 2]`. I take the max. Base cases are `dp[0] = 0` and `dp[1] = nums[0]`. That's O(n) time, and since each step looks two back, I can drop to two variables for O(1) space."

## Follow-ups interviewers ask

- **"What if the houses are in a circle?"** The first and last are now neighbours. Run this twice, once without the first house and once without the last. That's *House Robber II*.
- **"Which houses did you rob?"** Keep the full table, then walk back from `dp[n]`: if `dp[i] == dp[i − 1]` you skipped house `i − 1`, otherwise you robbed it and jump to `i − 2`.
- **"How is this like Maximum Subarray?"** Both make a two-way choice per element and carry one running best forward, which is why both shrink to O(1) space.
