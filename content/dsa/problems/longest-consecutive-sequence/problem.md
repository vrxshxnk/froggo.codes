---
id: lc-128
title: Longest Consecutive Sequence
pattern: Hash set + sequence starts
timeBox: 25
summary: Find the length of the longest run of consecutive integers (like 1, 2, 3, 4) that can be built from the array's values, in O(n).
hints:
  - "Sorting makes this easy in O(n log n), but the problem asks for O(n). What lets you check 'is x + 1 in the array?' in O(1)?"
  - "Put every number in a hash set. From any number you can count upward: x, x+1, x+2… while they exist."
  - "Counting upward from every number is O(n²). Only start counting from numbers that begin a run — those where x − 1 is NOT in the set."
insight: Only start counting at numbers with no left neighbour (x − 1 missing). Each run is then walked exactly once, so the whole scan is O(n).
time: O(n)
space: O(n)
related: [lc-217, lc-1, lc-49]
---

## The problem in plain English

Given an unsorted array `nums`, return the length of the longest sequence of **consecutive integers** whose values all appear in the array. The values can be in any order in the array. Your algorithm must run in **O(n)**.

`nums = [100, 4, 200, 1, 3, 2]` → `4`, because `1, 2, 3, 4` are all present.

## Start with brute force

**Sort, then scan.** After sorting, consecutive values sit next to each other. Walk the array, extending the current run when `nums[i] == nums[i−1] + 1`, skipping duplicates, and resetting otherwise.

That's O(n log n). Good to mention, but the problem explicitly asks for O(n), so sorting is out.

## Building the intuition

Put every value in a **hash set**, so "is `x + 1` present?" is O(1).

Now, from any number you could count upward: `x`, `x+1`, `x+2`, … until a number is missing. But if you do that from **every** number, a run of length L gets re-walked from each of its L members. For `[1, 2, 3, …, n]` that's O(n²).

The fix: **only start counting at the beginning of a run.** A number `x` begins a run exactly when `x − 1` is **not** in the set.

```
set: {1, 2, 3, 4, 100, 200}

1   → 0 not in set → START: count 1, 2, 3, 4 → length 4
2   → 1 is in set  → skip (it's in the middle of a run)
3   → skip
4   → skip
100 → 99 missing   → START: length 1
200 → 199 missing  → START: length 1
```

Every number is visited at most twice — once in the outer loop and once while some run counts through it — so the total is O(n).

## The optimal approach

1. Put all numbers in a set `s`.
2. For each `x` in `s` (iterate the set, so duplicates don't repeat work):
   - If `x − 1` is in `s`, skip — `x` isn't a start.
   - Otherwise count `length = 1` and keep going while `x + length` is in `s`.
   - Update `best = max(best, length)`.
3. Return `best`.

{{code}}

## Dry run

`nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]` → set `{0, 1, 2, 3, 4, 5, 6, 7, 8}`

| x | x − 1 in set? | action | best |
|---|---|---|---|
| 0 | no (−1) | count 0 → 8: length **9** | 9 |
| 1 – 8 | yes | skip | 9 |

Answer: **9**. Nine numbers, nine steps of counting, plus nine set checks.

## Complexity

- **Time: O(n).** Building the set is O(n). Each run is walked once from its start, so inner loops add up to n steps in total.
- **Space: O(n)** for the set.

## Edge cases and traps

- **Empty array.** Return 0.
- **Duplicates like `[1, 2, 2, 3]`.** Iterate over the set, not the array, or you'll re-scan from repeated starts. The answer is 3.
- **Negative numbers.** `x − 1` works the same way.
- **Iterating the array but checking starts.** Still O(n) in most cases, but a huge array of the same start value (e.g. many copies of 1 followed by a long run) repeats the inner walk. Iterating the set avoids it.

## Say it in the interview

> "Sorting gives O(n log n), but they want O(n). I put everything in a hash set. A number starts a run only if its predecessor is missing, so I only count upward from those starts. Each number is touched a constant number of times, which gives O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"Return the sequence itself?"** Remember the start and length of the best run, then rebuild it.
- **"What if numbers arrive one at a time?"** Union-Find (later in the bonus stage) merges a number with its neighbours as they arrive.
- **"Can you do it without extra memory?"** Only by sorting in place — O(n log n) time, O(1) space.
