---
id: lc-217
title: Contains Duplicate
pattern: Hash set membership
timeBox: 10
summary: Return true if any value appears at least twice in the array, false if every value is distinct.
hints:
  - "You only need to know one thing about each number: have I seen it before?"
  - "A hash set answers 'have I seen this?' in O(1)."
  - "Walk the array. If the number is already in the set, return true. Otherwise add it. If you finish the loop, return false."
insight: A hash set remembers everything you've seen and answers "seen it before?" in O(1), so a single pass finds the first repeat.
time: O(n)
space: O(n)
related: [lc-1, lc-242, lc-128]
---

## The problem in plain English

Given an array `nums`, return `true` if some value shows up **two or more times**, and `false` if every value is unique.

- `[1, 2, 3, 1]` → `true` (1 appears twice)
- `[1, 2, 3, 4]` → `false`

## Start with brute force

Compare every pair `(i, j)` with `i < j`. If any pair is equal, return `true`. That's O(n²) comparisons — too slow when `n` is 100,000.

## Building the intuition

There are two classic ways to beat O(n²), and you should know both:

1. **Sort first.** After sorting, equal values sit next to each other, so you only compare neighbours. O(n log n) time, and O(1) extra space if you sort in place.
2. **Remember what you've seen.** Keep a hash set. For each number, ask "is it already in the set?" That's O(1) per number, so O(n) total.

Interviewers love hearing both, because it shows you understand the **time vs. space trade-off**: sorting saves memory, the set saves time.

## The optimal approach

1. Create an empty hash set `seen`.
2. For each number `x`:
   - If `x` is in `seen`, return `true` — that's a duplicate.
   - Otherwise add `x` to `seen`.
3. If the loop ends, every number was unique: return `false`.

{{code}}

## Dry run

`nums = [1, 2, 3, 1]`

| x | `seen` before | In set? | Action |
|---|---|---|---|
| 1 | `{}` | No | add 1 |
| 2 | `{1}` | No | add 2 |
| 3 | `{1, 2}` | No | add 3 |
| 1 | `{1, 2, 3}` | **Yes** | return `true` |

## Complexity

- **Time: O(n).** Each lookup and insert is O(1) on average.
- **Space: O(n).** The set can hold every element if they're all unique.

The sorting alternative is **O(n log n) time, O(1) extra space** (ignoring the sort's own stack).

## Edge cases and traps

- **One element.** Can't have a duplicate: `false`.
- **Negative numbers and zero.** A set handles them like any other value.
- **Returning early.** Return `true` the moment you find a repeat — no need to finish the loop.
- **Python one-liner.** `len(set(nums)) != len(nums)` is correct and fine to mention, but it always processes the whole array; the loop stops early.

## Say it in the interview

> "Brute force compares every pair, O(n²). I can sort and compare neighbours in O(n log n) with no extra memory, or use a hash set: for each number, if it's already in the set I return true, otherwise I add it. That's O(n) time and O(n) space. I'd go with the set unless memory is tight."

## Follow-ups interviewers ask

- **"Duplicates within distance k?"** (Contains Duplicate II) Keep a map of value → last index, or a sliding-window set of size `k`.
- **"What if you can't use extra memory?"** Sort in place and compare neighbours.
- **"What if the values are in a small range, say 0 to 1000?"** Use a boolean array instead of a set — same idea, faster in practice.
