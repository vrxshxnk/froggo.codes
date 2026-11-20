---
id: lc-33
title: Search in Rotated Sorted Array
pattern: Find the pivot, then lower bound
timeBox: 25
summary: Find the index of a target in a sorted array of distinct numbers that has been rotated, or return -1, in O(log n) time.
hints:
  - "You already know how to find the smallest element of a rotated array in O(log n). What does the array look like on either side of it?"
  - "Split at the minimum and you get two sorted pieces. Every number in the right piece is <= the last element; every number in the left piece is bigger. So comparing the target with the last element tells you which piece to search."
  - "Step 1: find the pivot, the first index with nums[i] <= nums[n - 1]. Step 2: if target <= nums[n - 1], lower-bound search [pivot, n); otherwise search [0, pivot). Check the index you land on actually holds the target."
insight: A rotated array is two sorted pieces. Find where the second piece starts (Find Minimum in Rotated Sorted Array), compare the target with the last element to pick the piece, then run a normal lower bound on that piece. Two O(log n) searches, one template.
time: O(log n)
space: O(1)
related: [lc-153, lc-704, lc-34]
---

## The problem in plain English

You get `nums`, which was a sorted array of **distinct** numbers and then got **rotated**: some elements from the end were moved to the front, like `[0, 1, 2, 4, 5, 6, 7]` becoming `[4, 5, 6, 7, 0, 1, 2]`. You also get a `target`. Return its index, or `-1` if it isn't there, in O(log n) time. Up to 5000 elements.

Examples with `nums = [4, 5, 6, 7, 0, 1, 2]`: `target = 0` → `4`, and `target = 3` → `-1`.

## Start with brute force

Scan the array and return the index where `nums[i] == target`. That's O(n), up to 5000 steps. It works, but it ignores that the array is two sorted pieces, and the problem asks for O(log n).

## Building the intuition

You can't binary search the whole array with "is `nums[i] >= target`?", because it isn't sorted. For `target = 5` that question gives `F T T T F F F`, which isn't falses-then-trues.

But you've already solved the hard part. In *Find Minimum in Rotated Sorted Array*, you found the minimum in O(log n). Look at what's on each side of it:

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| nums[i] | 4 | 5 | 6 | 7 | **0** | 1 | 2 |
| piece | left | left | left | left | right | right | right |

Both pieces are **sorted**. So if you knew which piece holds the target, a normal binary search on that piece would finish the job.

Which piece? Use the last element again, `last = 2`. Every number in the right piece is `<= 2`. Every number in the left piece is `> 2`. So:

- `target <= last` → it can only be in the right piece, `[pivot, n)`.
- `target > last` → it can only be in the left piece, `[0, pivot)`.

That's the whole solution: two searches with the same template.

## The optimal approach

1. **Find the pivot.** With `last = nums[n - 1]`, find the first index where `nums[i] <= last`. Use `lo = 0`, `hi = n - 1`, exactly as in *Find Minimum in Rotated Sorted Array*. Call it `pivot`.
2. **Pick the piece.** If `target <= last`, search `lo = pivot`, `hi = n`. Otherwise search `lo = 0`, `hi = pivot`. Remember that right edge as `end`. It's the piece's past-the-end slot.
3. **Lower bound.** While `lo < hi`: `mid = lo + (hi - lo) // 2`. If `nums[mid] >= target`, set `hi = mid`, else `lo = mid + 1`.
4. **Check.** If `lo < end` and `nums[lo] == target`, return `lo`. Otherwise return `-1`.

**The subtle detail: the unrotated case.** If the array was never rotated, `pivot = 0`, so the left piece `[0, 0)` is empty. A target bigger than `last` is bigger than everything, so it's correctly not found: the search starts with `lo = hi = 0 = end`, and the check `lo < end` fails. No special case.

You'll also see a one-loop version that, at each `mid`, works out which half is sorted and whether the target lies inside it. It's also O(log n), but it has four branches and is a common place for off-by-one bugs. The two-search version reuses a loop you've already proved correct.

{{code}}

## Dry run

`nums = [4, 5, 6, 7, 0, 1, 2]`, `last = 2`.

**Step 1, find the pivot** (`nums[mid] <= 2?`):

| lo | mid | hi | nums[mid] | <= 2? | update |
|---|---|---|---|---|---|
| 0 | 3 | 6 | 7 | No | `lo = 4` |
| 4 | 5 | 6 | 1 | Yes | `hi = 5` |
| 4 | 4 | 5 | 0 | Yes | `hi = 4` |
| 4 | | 4 | | | `pivot = 4` |

**Target 0.** `0 <= 2`, so search the right piece: `lo = 4`, `hi = end = 7`. Question: `nums[mid] >= 0?`

| lo | mid | hi | nums[mid] | >= 0? | update |
|---|---|---|---|---|---|
| 4 | 5 | 7 | 1 | Yes | `hi = 5` |
| 4 | 4 | 5 | 0 | Yes | `hi = 4` |
| 4 | | 4 | | | stop |

`4 < 7` and `nums[4] = 0`. Return `4`.

**Target 3.** `3 > 2`, so search the left piece: `lo = 0`, `hi = end = 4`. Question: `nums[mid] >= 3?`

| lo | mid | hi | nums[mid] | >= 3? | update |
|---|---|---|---|---|---|
| 0 | 2 | 4 | 6 | Yes | `hi = 2` |
| 0 | 1 | 2 | 5 | Yes | `hi = 1` |
| 0 | 0 | 1 | 4 | Yes | `hi = 0` |
| 0 | | 0 | | | stop |

`nums[0] = 4`, not 3. Return `-1`.

## Complexity

- **Time: O(log n).** Two binary searches, each O(log n). Two times log n is still O(log n): about 26 steps for 5000 elements.
- **Space: O(1).** A handful of integers.

## Edge cases and traps

- **Not rotated.** `pivot = 0`. Targets `<= last` search the whole array; bigger targets search an empty piece and return `-1`.
- **One element.** `pivot = 0`. If `target <= nums[0]`, search `[0, 1)`; otherwise the left piece is empty. Both give the right answer.
- **Target equals `last`.** It belongs to the right piece: use `<=`, not `<`, when picking.
- **Picking the piece with `target >= nums[0]`.** It looks symmetric, but in an unrotated array like `[1, 2, 3]` every target `>= 1` gets sent to the left piece `[0, 0)`, which is empty, so `2` is "not found". Comparing with the last element has no such hole.
- **Duplicates.** This problem promises distinct values. With duplicates, the pivot search breaks; see the follow-up.

## Say it in the interview

> "A rotated sorted array is two sorted pieces. First I binary search for where the second piece starts: the first index whose value is at most the last element. Everything in the second piece is at most the last element and everything in the first piece is bigger, so comparing the target with the last element tells me which piece to search. Then I run a normal lower bound on that piece and check that the index holds the target. Two binary searches, so O(log n) time and O(1) space."

## Follow-ups interviewers ask

- **"Can you do it in a single pass?"** Yes: at each `mid`, one of the halves `[lo, mid]` or `[mid, hi]` is sorted. Check whether the target lies inside the sorted half's range; if so go there, else go to the other half. Same O(log n), just one loop.
- **"What if there are duplicates?"** That's *Search in Rotated Sorted Array II*. With `[1, 1, 1, 3, 1]`, you can't tell the pieces apart by comparing with `last`. The usual fix shrinks the range by one when the ends are equal, which is O(n) in the worst case.
- **"Return where it was in the original, unrotated array?"** It's `(index - pivot + n) % n`.
