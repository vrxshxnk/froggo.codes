---
id: lc-70
title: Climbing Stairs
pattern: 1D DP on the last move
timeBox: 15
summary: Count how many different sequences of 1-steps and 2-steps take you exactly to the top of an n-step staircase.
hints:
  - "Don't think about the first move. Think about the last one: how could you have arrived on step n?"
  - "You arrived either from step n − 1 (with a 1-step) or from step n − 2 (with a 2-step). Those two groups of climbs never overlap."
  - "So ways(n) = ways(n − 1) + ways(n − 2). Store the answers in an array from step 0 upwards, with ways(0) = ways(1) = 1."
insight: The last move onto step i was a 1-step or a 2-step, so dp[i] = dp[i − 1] + dp[i − 2]. Fill it from the bottom step up and every value you need is already there.
time: O(n)
space: O(n)
related: [lc-198, lc-62, lc-322]
---

## The problem in plain English

You stand at the bottom of a staircase with `n` steps. Each move, you climb either **1 step** or **2 steps**. Return how many **different sequences of moves** land you exactly on step `n`. Order matters: `1 + 2` and `2 + 1` are different climbs.

`n` is between 1 and 45, and the answer always fits in a 32-bit integer.

Example: `n = 3` → `3`. The climbs are `1 + 1 + 1`, `1 + 2` and `2 + 1`.

## Start with brute force

Try every climb. From step `i`, branch twice: take a 1-step, or take a 2-step. Count every branch that lands exactly on `n`.

```python
def ways(i):
    if i <= 1:
        return 1
    return ways(i - 1) + ways(i - 2)
```

It's correct, but each call makes two more calls, so the work roughly multiplies by 1.6 per step. For `n = 45` that's about 3.7 billion calls. Look at why: `ways(5)` calls `ways(4)` and `ways(3)`, and `ways(4)` calls `ways(3)` *again*. The same small questions get answered over and over.

## Building the intuition

Draw the calls for `n = 5`. `ways(3)` shows up twice. `ways(2)` shows up three times. Yet there are only six different questions in the whole tree: `ways(0)` up to `ways(5)`.

So write each answer down the first time you work it out. That's the whole idea of dynamic programming.

Now walk through the 4-step recipe from the primer.

1. **State.** `dp[i]` means *the number of different ways to stand on step `i`*.
2. **Recurrence.** Think about the **last move**. To stand on step `i`, your last move was either a 1-step from `i − 1` or a 2-step from `i − 2`. Every climb to `i` falls into exactly one of those two groups. So `dp[i] = dp[i − 1] + dp[i − 2]`.
3. **Base cases.** `dp[0] = 1`: there's one way to "be" on the ground, by doing nothing. `dp[1] = 1`: a single 1-step. (Check: `dp[2] = dp[1] + dp[0] = 2`, which is `1 + 1` and `2`. Correct.)
4. **Order.** `dp[i]` reads smaller indices only, so fill from `i = 2` upwards.

Notice something? This is the Fibonacci sequence. You don't need to spot that; the recipe gets you there anyway.

## The optimal approach

1. Make an array `dp` of size `n + 1`.
2. Set `dp[0] = 1` and `dp[1] = 1`.
3. For `i` from 2 to `n`: `dp[i] = dp[i − 1] + dp[i − 2]`.
4. Return `dp[n]`.

**The subtle detail: why `dp[0] = 1` and not 0.** It feels odd to say there's one way to climb zero stairs. But `dp[0]` stands for "the 2-step that lands you on step 2 from the ground". If it were 0, `dp[2]` would come out as 1, and you'd lose the climb that's a single 2-step.

**Space optimisation.** `dp[i]` only reads the two cells just before it, so you can keep two variables instead of the whole array. That gets space down to O(1):

```python
prev2, prev1 = 1, 1          # dp[i-2], dp[i-1]
for i in range(2, n + 1):
    prev2, prev1 = prev1, prev1 + prev2
return prev1
```

The code below keeps the full table, so you can see every cell from the dry run.

{{code}}

## Dry run

`n = 5`. Each row fills one cell from the two before it.

| i | dp[i − 2] | dp[i − 1] | dp[i] = dp[i − 1] + dp[i − 2] | dp after this step |
|---|---|---|---|---|
| 0 | — | — | 1 (base) | `[1, _, _, _, _, _]` |
| 1 | — | — | 1 (base) | `[1, 1, _, _, _, _]` |
| 2 | 1 | 1 | 2 | `[1, 1, 2, _, _, _]` |
| 3 | 1 | 2 | 3 | `[1, 1, 2, 3, _, _]` |
| 4 | 2 | 3 | 5 | `[1, 1, 2, 3, 5, _]` |
| 5 | 3 | 5 | **8** | `[1, 1, 2, 3, 5, 8]` |

The answer is `dp[5] = 8`. We made 4 additions instead of the 15 calls the brute force needs for `n = 5`.

## Complexity

- **Time: O(n).** One pass from 2 to `n`, one addition per cell.
- **Space: O(n)** for the table. With the two-variable version it drops to **O(1)**.

## Edge cases and traps

- **`n = 1`.** The array has size 2, so `dp[1]` exists and the loop doesn't run. Returns 1. If you start with a size-`n` array, `dp[1]` would be out of bounds.
- **Base case `dp[0] = 0`.** Makes every answer wrong from `dp[2]` on. See the subtle detail above.
- **Memo without a memo.** Writing the recursion and forgetting to cache it gives the right answers and times out on large `n`.
- **Overflow for bigger versions.** `n = 45` gives 1,836,311,903, just under 2³¹ − 1. If an interviewer raises the limit, switch to 64-bit integers.

## Say it in the interview

> "Let `dp[i]` be the number of ways to reach step `i`. My last move was either a 1-step from `i − 1` or a 2-step from `i − 2`, and those groups don't overlap, so `dp[i] = dp[i − 1] + dp[i − 2]`. Base cases are `dp[0] = dp[1] = 1`. I fill the table bottom-up in O(n) time. Since each cell only looks two back, I can keep just two variables and get O(1) space."

## Follow-ups interviewers ask

- **"What if you can take 1, 2 or 3 steps?"** Same last-move idea: `dp[i] = dp[i − 1] + dp[i − 2] + dp[i − 3]`, with `dp[0] = 1`.
- **"What if the allowed step sizes are a list?"** `dp[i] = sum of dp[i − s]` for each allowed size `s ≤ i`. This is counting ordered combinations, a cousin of *Coin Change*.
- **"Can you do better than O(n)?"** Yes: it's Fibonacci, so matrix exponentiation gives O(log n). Worth knowing it exists; rarely required.
