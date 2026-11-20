---
id: lc-15
title: 3Sum
pattern: Sort, fix one, two pointers
timeBox: 25
summary: Find every distinct triplet of numbers in an array that adds up to zero, without listing the same triplet twice.
hints:
  - "If you fix the first number of the triplet as x, what do the other two numbers need to add up to?"
  - "After fixing x, you need two numbers summing to −x. You've solved that already on a sorted array in Two Sum II. So sort first."
  - "Sort. For each i, run two pointers on the part to the right of i looking for −nums[i]. Skip an i whose value equals the previous one, and after a hit, move left past copies of the same value."
insight: Sorting turns 3Sum into n runs of Two Sum II. Fix the smallest number, then sweep two pointers over the rest. Sorting also puts duplicates side by side, so skipping repeats is a single comparison with the neighbour.
time: O(n²)
space: O(1)
related: [lc-1, lc-167, lc-11]
---

## The problem in plain English

You get an integer array `nums`. Return every triplet `[a, b, c]` taken from three **different positions** where `a + b + c = 0`. The list must not contain the same triplet twice, even if the array has repeated values. The order of the triplets, and the order inside each triplet, doesn't matter.

Constraints that matter: 3 to 3000 numbers, each between −10⁵ and 10⁵.

Example: `nums = [-1, 0, 1, 2, -1, -4]` → `[[-1, -1, 2], [-1, 0, 1]]`. There are two `-1`s, so `[-1, 0, 1]` can be built two ways, but it appears only once in the answer.

## Start with brute force

Three nested loops try every `i < j < k`. To remove duplicates, sort each found triplet and put it in a set.

That's about n³/6 checks. For n = 3000 that's 4.5·10⁹, which is far too slow. On top of that, the set trick for duplicates is clumsy. We want an approach that never produces a duplicate in the first place.

## Building the intuition

Three unknowns is hard. Can you make it two?

Fix one number. Say the triplet's first number is `x = nums[i]`. Now you need two other numbers that sum to `−x`. That's *Two Sum*. And if the array is **sorted**, it's *Two Sum II*, which you can solve in one O(n) sweep with two pointers and no extra memory.

So: sort, then for each `i`, run Two Sum II on everything to the right of `i`. That's n sweeps of O(n), so O(n²) in total. That's a huge win over n³.

Sorting gives you a second gift, which is how you handle duplicates. In a sorted array, equal values sit next to each other. Look at `[-4, -1, -1, 0, 1, 2]`. When `i` is on the first `-1`, the sweep finds every triplet that starts with `-1`. When `i` moves to the second `-1`, it would find **the same triplets again**. So the rule is: if `nums[i] == nums[i - 1]`, skip this `i`.

The same thing happens inside the sweep. After you find a triplet, if the next `left` holds the same value, it would produce the same triplet. So keep stepping `left` while it equals the value you just used.

## The optimal approach

1. Sort `nums`.
2. For each `i` from 0 to n − 3:
   - If `nums[i] > 0`, stop. The array is sorted, so all three numbers would be positive and can't sum to 0.
   - If `i > 0` and `nums[i] == nums[i − 1]`, skip it. Those triplets are already found.
   - Set `left = i + 1` and `right = n − 1`. While `left < right`:
     - `total = nums[i] + nums[left] + nums[right]`;
     - if `total < 0`, do `left += 1`; if `total > 0`, do `right -= 1`;
     - if `total == 0`, record the triplet, move both pointers inwards, then keep moving `left` while `nums[left] == nums[left − 1]`.
3. Return the list.

**The subtle detail:** after a hit, you only need to skip duplicates on the `left` side. Once `left` is on a new value, the old `right` value can't complete a triplet with it: `nums[i]` is fixed and `nums[left]` changed, so the partner needed changed too. The normal "too big, move right" rule moves `right` off the old value on its own.

{{code}}

## Dry run

`nums = [-1, 0, 1, 2, -1, -4]`. After sorting: `[-4, -1, -1, 0, 1, 2]` (indices 0–5).

| i | nums[i] | left, right | total | Action |
|---|---|---|---|---|
| 0 | −4 | 1, 5 | −4 − 1 + 2 = −3 | too small, left → 2 |
| 0 | −4 | 2, 5 | −3 | left → 3 |
| 0 | −4 | 3, 5 | −2 | left → 4 |
| 0 | −4 | 4, 5 | −1 | left → 5, the pointers meet |
| 1 | −1 | 2, 5 | −1 − 1 + 2 = 0 | **record `[-1, -1, 2]`**, move to 3, 4 |
| 1 | −1 | 3, 4 | −1 + 0 + 1 = 0 | **record `[-1, 0, 1]`**, move to 4, 3 and stop |
| 2 | −1 | — | — | same as `nums[1]`, skip |
| 3 | 0 | 4, 5 | 0 + 1 + 2 = 3 | too big, right → 4, stop |

The loop ends after `i = 3`, since `i` only goes up to n − 3. Two triplets, and no duplicates.

## Complexity

- **Time: O(n²).** The sort is O(n log n). Then each of the n values of `i` runs one O(n) two-pointer sweep. The n² term dominates. For n = 3000 that's around 4.5·10⁶ steps.
- **Space: O(1) extra**, apart from the output and whatever the sort uses internally (O(log n) for typical in-place sorts).

## Edge cases and traps

- **All zeros.** `[0, 0, 0, 0]` → `[[0, 0, 0]]`, just once. Both duplicate skips are needed for this.
- **No answer.** `[0, 1, 1]` → `[]`. Return an empty list, not `null`.
- **Skipping with `nums[i] == nums[i + 1]`.** That's the wrong neighbour. It would skip the first `-1` and lose `[-1, -1, 2]`. Compare with the **previous** value.
- **JavaScript's default sort.** `[-1, -4, 2].sort()` sorts as strings. Always pass `(a, b) => a - b`.
- **Early break.** `nums[i] > 0` is a valid stop. `nums[i] >= 0` is not, because it would lose `[0, 0, 0]`.

## Say it in the interview

> "Brute force is O(n³). If I fix the first number, I need two others summing to its negative, and on a sorted array that's Two Sum II with two pointers. So I sort, then for each index I sweep two pointers over the rest, which is O(n²) total. Sorting also puts duplicates next to each other. I skip an index whose value equals the previous one, and after finding a triplet I move left past equal values, so every triplet appears once. I can also stop as soon as the fixed number is positive."

## Follow-ups interviewers ask

- **"3Sum Closest: the triplet whose sum is closest to a target?"** Same sweep. Track the best `|total − target|`, and move pointers by comparing `total` with `target`.
- **"4Sum?"** Fix two numbers with two loops, then two pointers: O(n³). In general, kSum is k − 2 loops around Two Sum II.
- **"Can you do it with a hash set instead of sorting?"** Yes. For each `i`, run *Two Sum* with a set on the rest. It's also O(n²), but avoiding duplicates gets messier and it uses O(n) memory.
