---
id: lc-560
title: Subarray Sum Equals K
pattern: Prefix sum + hash map
timeBox: 25
summary: Count how many contiguous subarrays have a sum exactly equal to k.
hints:
  - "The sum of the subarray from index j+1 to i equals prefix[i] − prefix[j], where prefix[i] is the sum of the first i+1 elements."
  - "So a subarray ending at i sums to k exactly when some earlier prefix sum equals prefix[i] − k. This is Two Sum again, in disguise."
  - "Keep a hash map: prefix sum → how many times you've seen it. Start it with {0: 1} for the empty prefix. At each step, add map[prefix − k] to the answer, then record the current prefix."
insight: A subarray sum is a difference of two prefix sums. Counting subarrays ending at i that sum to k means counting earlier prefix sums equal to (current prefix − k) — a hash map lookup.
time: O(n)
space: O(n)
related: [lc-1, lc-238, lc-209, cf-1520d]
---

## The problem in plain English

Given an array `nums` (which may contain **negative numbers**) and an integer `k`, count the **contiguous** subarrays whose elements add up to exactly `k`.

- `nums = [1, 1, 1]`, `k = 2` → `2` (the subarrays `[1,1]` at positions 0–1 and 1–2)
- `nums = [1, 2, 3]`, `k = 3` → `2` (`[1,2]` and `[3]`)

## Start with brute force

Try every start `j` and extend the end `i`, keeping a running sum. Count the times it equals `k`. That's O(n²) — every subarray is checked once.

**Why not a sliding window?** Windows work when all numbers are positive (growing the window only increases the sum). Here numbers can be negative, so shrinking or growing doesn't move the sum predictably. That rules the window out and points us to prefix sums.

## Building the intuition

Define `prefix` as "the sum of everything so far". The sum of a subarray is the difference of two prefixes:

```
nums:      3   4   7   2  -3   1
prefix:    3   7  14  16  13  14

sum of nums[2..3] = 7 + 2 = 9 = prefix[3] − prefix[1] = 16 − 7
```

So when we're standing at index `i` with running prefix `P`, a subarray ending here sums to `k` exactly when an **earlier** prefix equals `P − k`.

That is *Two Sum* again: for the current value, we know exactly which partner we need. And since we're **counting**, the map stores **how many times** each prefix sum has appeared.

**The `{0: 1}` seed.** A subarray that starts at index 0 has nothing before it, which is like an "empty prefix" with sum 0. Seeding the map with `0 → 1` counts those subarrays.

## The optimal approach

1. `count = {0: 1}`, `prefix = 0`, `answer = 0`.
2. For each number `x`:
   - `prefix += x`
   - `answer += count[prefix − k]` (0 if missing)
   - `count[prefix] += 1`
3. Return `answer`.

Look up **before** recording the current prefix, or you'd pair a prefix with itself (an empty subarray) whenever `k = 0`.

{{code}}

## Dry run

`nums = [1, 2, 3]`, `k = 3`

| x | prefix | need = prefix − 3 | count before | add | answer |
|---|---|---|---|---|---|
| 1 | 1 | −2 | `{0:1}` | 0 | 0 |
| 2 | 3 | 0 | `{0:1, 1:1}` | 1 (`[1,2]`) | 1 |
| 3 | 6 | 3 | `{0:1, 1:1, 3:1}` | 1 (`[3]`) | 2 |

Answer: **2**.

## Complexity

- **Time: O(n).** One pass, O(1) average per map operation.
- **Space: O(n).** Up to n distinct prefix sums in the map.

## Edge cases and traps

- **Forgetting `{0: 1}`.** You'll miss every subarray that starts at index 0.
- **Negative numbers.** They're exactly why a sliding window fails; prefix sums don't care.
- **k = 0.** Works as long as you look up before you insert.
- **Using a set instead of a map.** The same prefix can appear many times — each occurrence is a different subarray. You need counts.

## Say it in the interview

> "Negative numbers rule out a sliding window. A subarray sum is prefix[i] minus prefix[j], so for each position I need the number of earlier prefixes equal to prefix minus k. I keep a hash map of prefix sum to count, seeded with zero once for subarrays starting at index 0. One pass, O(n) time and space."

## Follow-ups interviewers ask

- **"Return the longest such subarray instead?"** Store the **first index** of each prefix sum instead of a count.
- **"Count subarrays whose sum is divisible by k?"** (LeetCode 974) Use `prefix mod k` as the key — watch out for negative remainders.
- **"What if all numbers are positive?"** A sliding window works and uses O(1) space.
