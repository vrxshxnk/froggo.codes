---
id: lc-300
title: Longest Increasing Subsequence
pattern: 1D DP, then patience tails
timeBox: 25
summary: Find the length of the longest subsequence of an array whose values strictly increase from left to right.
hints:
  - "Let dp[i] be the length of the longest increasing subsequence that ends exactly at nums[i]. How does it relate to the dp values before i?"
  - "dp[i] = 1 + the largest dp[j] over every j < i with nums[j] < nums[i]. That's O(n²). To go faster, ask a different question: for each length, what is the smallest value a subsequence of that length can end with?"
  - "Keep tails[k] = the smallest ending value of an increasing subsequence of length k + 1. tails is sorted, so for each x binary-search the first tail ≥ x: replace it, or append if there is none. The answer is len(tails)."
insight: dp[i] (the longest increasing run ending at nums[i]) is 1 + the best dp[j] with a smaller value. Keeping only the smallest possible ending value for each length gives a sorted array, so that lookup becomes a binary search.
time: O(n log n)
space: O(n)
related: [lc-1143, lc-704, lc-322]
---

## The problem in plain English

You get an integer array `nums`. A **subsequence** keeps some elements in their original order and may skip others (it doesn't have to be contiguous). Return the length of the longest subsequence whose values are **strictly increasing**: each value bigger than the one before, with no equal neighbours.

`nums` has 1 to 2500 elements, each between −10⁴ and 10⁴.

Example: `nums = [10, 9, 2, 5, 3, 7, 101, 18]` → `4`. One answer is `[2, 3, 7, 18]`; `[2, 5, 7, 101]` works too.

## Start with brute force

Try every subsequence, keep those that increase, return the longest. There are 2ⁿ subsequences; for `n = 2500` that number has over 750 digits. No chance.

## Building the intuition

### Step 1: the O(n²) DP

Use the recipe. The trick for subsequences is to pin down **where the subsequence ends**.

1. **State.** `dp[i]` means *the length of the longest increasing subsequence that ends exactly at `nums[i]`* (it must use `nums[i]` as its last element).
2. **Recurrence.** The element before `nums[i]` is some `nums[j]` with `j < i` and `nums[j] < nums[i]`. Extend the best one: `dp[i] = 1 + max(dp[j])` over those `j`, or 1 if there are none.
3. **Base case.** Every element alone is an increasing subsequence of length 1.
4. **Order.** Left to right. The answer is the **max of the whole table**, not `dp[n − 1]`, because the best subsequence can end anywhere.

```python
dp = [1] * n
for i in range(n):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
return max(dp)
```

That's O(n²): about 3 million steps for `n = 2500`. It passes, and it's what you should say first in an interview.

### Step 2: where is the waste?

For each `i`, the inner loop asks: *"of all earlier subsequences ending below `nums[i]`, which is longest?"* It scans everything to answer that.

Flip the question. Instead of remembering every ending, remember for **each length** the **smallest value** a subsequence of that length can end with. A smaller ending is always at least as good: anything that can extend a subsequence ending in 7 can also extend one ending in 3.

Call it `tails[k]` = *the smallest value that can end an increasing subsequence of length `k + 1`*. This list is always **sorted** (a longer subsequence can't end lower than the best shorter one). Sorted means binary search.

For a new value `x`, find `k`, the first slot with `tails[k] ≥ x`:

- Every slot before `k` holds a tail smaller than `x`, so `x` can extend a subsequence of length `k`. The best subsequence ending at `x` has length `k + 1`. **That's exactly `dp[i]`.**
- If `k` is past the end, `x` makes a new longest length: append it.
- Otherwise `x` is a smaller ending for length `k + 1`: overwrite `tails[k] = x`.

## The optimal approach

1. Start with an empty `tails`.
2. For each `x` in `nums`:
   - `k` = first index with `tails[k] ≥ x` (a lower-bound binary search).
   - If `k == len(tails)`, append `x`. Otherwise set `tails[k] = x`.
3. Return `len(tails)`.

**The subtle detail: `≥`, not `>`.** "Strictly increasing" means an equal value can't extend. Searching for the first tail `≥ x` makes an equal value *replace* that tail instead of appending after it. With `[7, 7, 7]` you get length 1, as you should. (Python's `bisect_left` and C++'s `lower_bound` do exactly this.)

**Warning:** `tails` is *not* the subsequence itself. It's a mix of endings from different candidates. Only its length is meaningful.

{{code}}

## Dry run

`nums = [10, 9, 2, 5, 3, 7, 101, 18]`. The last column is `dp[i] = k + 1`, the same table the O(n²) version fills.

| i | x | tails before | k (first tail ≥ x) | action | tails after | dp[i] |
|---|---|---|---|---|---|---|
| 0 | 10 | `[]` | 0 (end) | append | `[10]` | 1 |
| 1 | 9 | `[10]` | 0 | replace 10 | `[9]` | 1 |
| 2 | 2 | `[9]` | 0 | replace 9 | `[2]` | 1 |
| 3 | 5 | `[2]` | 1 (end) | append | `[2, 5]` | 2 |
| 4 | 3 | `[2, 5]` | 1 | replace 5 | `[2, 3]` | 2 |
| 5 | 7 | `[2, 3]` | 2 (end) | append | `[2, 3, 7]` | 3 |
| 6 | 101 | `[2, 3, 7]` | 3 (end) | append | `[2, 3, 7, 101]` | 4 |
| 7 | 18 | `[2, 3, 7, 101]` | 3 | replace 101 | `[2, 3, 7, 18]` | 4 |

Full DP table: `dp = [1, 1, 1, 2, 2, 3, 4, 4]`, max 4. And `len(tails) = 4`. Same answer, but each row cost one binary search instead of a scan.

## Complexity

- **Time: O(n log n).** One binary search over at most `n` tails per element.
- **Space: O(n)** for `tails` (the O(n²) version also needs O(n) for `dp`).

## Edge cases and traps

- **Returning `dp[n − 1]` in the O(n²) version.** The longest subsequence may end earlier. Return `max(dp)`.
- **Duplicates.** `[7, 7, 7]` → 1. Using `bisect_right` / `upper_bound` would give 3, the answer for "non-decreasing".
- **Reading `tails` as the answer subsequence.** In the dry run, `[2, 3, 7, 18]` happens to be valid, but in general it isn't. To rebuild a real subsequence, store each element's predecessor.
- **Already sorted, or reverse sorted.** `[1, 2, 3, 4, 5]` → 5 (append every time). `[5, 4, 3, 2, 1]` → 1 (replace slot 0 every time).

## Say it in the interview

> "Let `dp[i]` be the longest increasing subsequence ending at `nums[i]`. It's 1 plus the best `dp[j]` with a smaller value before it, which is O(n²). To speed it up I keep `tails[k]`, the smallest value that ends an increasing subsequence of length `k + 1`. That list stays sorted, so for each number I binary-search the first tail that's at least as big and replace it, or append if there isn't one. The insertion position plus one is `dp[i]`. The answer is the length of `tails`: O(n log n) time, O(n) space."

## Follow-ups interviewers ask

- **"Return the subsequence itself."** Store, for each element, the index of the element before it (from `tails` positions), then walk back from the last element of the longest one.
- **"Non-decreasing instead of strictly increasing?"** Search for the first tail **strictly greater** than `x` (`bisect_right`).
- **"Russian Doll Envelopes?"** Sort by width ascending and height descending, then run this LIS on heights. The descending tie-break stops equal widths from nesting.
