---
id: lc-53
title: Maximum Subarray
pattern: Kadane's running sum
timeBox: 25
summary: Find the contiguous stretch of the array with the largest possible sum and return that sum.
hints:
  - "Instead of asking about every subarray, ask a smaller question at each index: what's the best sum of a subarray that ends exactly here?"
  - "The best subarray ending at i either is nums[i] alone, or extends the best subarray ending at i − 1. When is extending a bad idea?"
  - "Keep a running sum cur. At each x, set cur = max(x, cur + x): if the sum so far is negative, drop it and start fresh at x. Track the best cur you ever see."
insight: A negative running sum can only make whatever comes next smaller, so throw it away and restart. Keeping the best "sum ending here" as you go finds the answer in one pass.
time: O(n)
space: O(1)
related: [lc-121, lc-560, lc-198]
---

## The problem in plain English

You get an integer array `nums` (with at least one element, possibly negative numbers). Pick a **subarray**: a contiguous, non-empty stretch like `nums[2..5]`. Return the largest sum any subarray can have.

`n` is up to 10⁵ and each value is between −10⁴ and 10⁴.

Example: `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` → `6`, from the subarray `[4, -1, 2, 1]`.

If every number is negative, the answer is the single largest one: `[-5, -2, -8]` → `-2`. The subarray can't be empty.

## Start with brute force

Try every start `i`. From there, extend the end `j` one step at a time, keeping a running sum, and record the best.

```python
best = nums[0]
for i in range(n):
    s = 0
    for j in range(i, n):
        s += nums[j]
        best = max(best, s)
```

That's correct and O(n²). For `n = 10⁵`, it's about 5·10⁹ additions. Too slow.

## Building the intuition

The brute force answers "best subarray starting at `i`" for every `i`. Flip it: at each index, ask **"what's the best sum of a subarray that ends exactly here?"** Call it `cur`.

A subarray ending at index `i` is one of two things:

- just `nums[i]` on its own, or
- the best subarray ending at `i − 1`, with `nums[i]` stuck on the end.

So `cur = max(nums[i], cur + nums[i])`. And when is starting fresh better? Exactly when the old `cur` is **negative**. A negative prefix is dead weight: whatever comes next, it's bigger without it.

Walk through the example and feel it. At `-2`, `cur = -2`. At `1`: carrying `-2` gives `-1`, but `1` alone is better, so we drop the past and `cur = 1`. At `-3`: `1 − 3 = -2` beats `-3` alone, so `cur = -2`. At `4`: carrying `-2` would hurt, so restart, `cur = 4`. Then `3, 5, 6`: the running sum climbs to `6`, which is the answer.

The answer is the best `cur` you ever saw, because the best subarray has to end *somewhere*.

This is **Kadane's algorithm**. You can read it as greedy ("never keep a negative prefix") or as dynamic programming (`dp[i] = max(nums[i], dp[i − 1] + nums[i])`, kept in one variable because you only ever look one step back). Both views are worth saying in an interview.

Why is the greedy drop safe? Take any subarray that starts with a prefix whose sum is negative. Cut that prefix off and the sum goes *up*. So the best subarray never starts with a negative-sum prefix, and dropping one never loses the answer.

## The optimal approach

1. `best = cur = nums[0]`.
2. For every later `x`:
   - `cur = max(x, cur + x)`: extend, or restart at `x`;
   - `best = max(best, cur)`.
3. Return `best`.

The subtle detail is the **start value**. Starting `best` at `0` looks natural, but on `[-3]` it returns `0`, which is the sum of an empty subarray, and that's not allowed. Start both variables at `nums[0]`.

{{code}}

## Dry run

`nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`

| i | x | cur + x | x alone | new cur | best |
|---|---|---|---|---|---|
| 0 | -2 | — | — | -2 | -2 |
| 1 | 1 | -1 | 1 | 1 (restart) | 1 |
| 2 | -3 | -2 | -3 | -2 | 1 |
| 3 | 4 | 2 | 4 | 4 (restart) | 4 |
| 4 | -1 | 3 | -1 | 3 | 4 |
| 5 | 2 | 5 | 2 | 5 | 5 |
| 6 | 1 | 6 | 1 | 6 | **6** |
| 7 | -5 | 1 | -5 | 1 | 6 |
| 8 | 4 | 5 | 4 | 5 | 6 |

The winning subarray starts at the last restart before the best (`i = 3`) and ends at `i = 6`: `[4, -1, 2, 1]`.

## Complexity

- **Time: O(n).** One pass, constant work per element.
- **Space: O(1).** Two variables.

## Edge cases and traps

- **All negative numbers.** `[-5, -2, -8, -1]` → `-1`. Initialising `best = 0` breaks this.
- **Restarting on `cur < 0` *after* adding.** Some write "add x; if `cur < 0`, reset to 0; update best." The order matters. Update `best` before resetting, or the all-negative case fails. `max(x, cur + x)` avoids the whole question.
- **Returning the subarray instead of the sum.** The problem asks for the sum. If an interviewer wants the indices, see the follow-ups.
- **Overflow worries.** At most 10⁵ × 10⁴ = 10⁹ in absolute value, which fits in a 32-bit int.

## Say it in the interview

> "Brute force tries every start and end, O(n²). Instead, I track the best sum of a subarray ending at the current index. At each element I either extend the previous best or start fresh here, so cur = max(x, cur + x). Starting fresh wins exactly when the running sum is negative, because a negative prefix only drags the total down. The answer is the max cur I ever see. That's Kadane's algorithm: one pass, O(n) time, O(1) space. I initialise with the first element so an all-negative array works."

## Follow-ups interviewers ask

- **"Return the start and end indices."** Keep `start` and set it to `i` whenever you restart; when `best` improves, save `(start, i)`.
- **"Do it with divide and conquer."** Split in half. The best subarray is in the left half, in the right half, or crosses the middle: best suffix of the left plus best prefix of the right. That's O(n log n), slower, but it's the approach LeetCode's own follow-up asks for.
- **"What if the array is circular?"** Either the best subarray doesn't wrap (plain Kadane), or it wraps, which means it's the total minus the *minimum* subarray. Take the larger, and watch for the all-negative case where the minimum is the whole array.
