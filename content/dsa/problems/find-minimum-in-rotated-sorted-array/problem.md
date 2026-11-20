---
id: lc-153
title: Find Minimum in Rotated Sorted Array
pattern: Binary search on a rotation predicate
timeBox: 25
summary: A sorted array of distinct numbers was rotated (its tail moved to the front); find its smallest element in O(log n) time.
hints:
  - "Draw the array as a graph: it climbs, drops once, then climbs again. The minimum is right after the drop. What separates the numbers before the drop from the numbers after it?"
  - "Every number before the drop is bigger than the last element of the array. Every number after the drop, including the minimum, is less than or equal to it."
  - "The question 'is nums[i] <= nums[n - 1]?' goes F F F T T. Binary search for the first T with lo = 0 and hi = n - 1 (the last index is always T). That index holds the minimum."
insight: The array isn't sorted, but "nums[i] <= last element" is false for the part before the drop and true from the minimum onwards. That's monotonic, so binary search finds the first true, which is the minimum.
time: O(log n)
space: O(1)
related: [lc-33, lc-704, lc-34]
---

## The problem in plain English

Take a sorted array of **distinct** numbers, like `[0, 1, 2, 4, 5, 6, 7]`, and rotate it: move some number of elements from the end to the front, giving say `[4, 5, 6, 7, 0, 1, 2]`. It may have been rotated anywhere from 1 to `n` times, and rotating `n` times gives the original sorted array back.

You get the rotated array. Return its **minimum** element, in O(log n) time. Up to 5000 elements.

Example: `nums = [3, 4, 5, 1, 2]` → `1`. This was `[1, 2, 3, 4, 5]` rotated 3 times.

## Start with brute force

Scan the array and keep the smallest value: O(n). A slightly smarter scan finds the one place where `nums[i] > nums[i + 1]`; the minimum is `nums[i + 1]`. Still O(n).

That's 5000 steps here, which is fine for a computer, but the problem asks for O(log n), about 13 steps. A scan doesn't use the fact that the array is *almost* sorted.

## Building the intuition

Draw `[4, 5, 6, 7, 0, 1, 2]` as a graph. It's two staircases: one climbs from 4 to 7, then it drops, and a second one climbs from 0 to 2. The minimum is the bottom of the second staircase.

Binary search needs a yes/no question that's false and then true. The array isn't sorted, so `nums[i] >= x` won't work. Is there something that **tells the two staircases apart**?

Look at the last element, 2. The whole second staircase ends at 2, so all of it is `<= 2`. The first staircase starts above where the second one ends (that's how rotation works), so all of it is `> 2`.

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| nums[i] | 4 | 5 | 6 | 7 | **0** | 1 | 2 |
| nums[i] <= 2? | F | F | F | F | **T** | T | T |

Falses, then trues, and the first true is the minimum. So this is the primer's template again, with a new question.

What if the array wasn't rotated at all, like `[11, 13, 15, 17]`? Then everything is `<= 17`, so it's all T, the first T is index 0, and `nums[0] = 11` is the minimum. No special case needed.

## The optimal approach

1. Let `last = nums[n - 1]`.
2. Set `lo = 0` and `hi = n - 1`. The last index is always true (`last <= last`), so `hi` starts on a known true. No past-the-end slot is needed here.
3. While `lo < hi`:
   - `mid = lo + (hi - lo) // 2`.
   - If `nums[mid] <= last`, `mid` is in the second staircase, so the minimum is `mid` or to its left: `hi = mid`.
   - Otherwise `mid` is in the first staircase, and the minimum is strictly to the right: `lo = mid + 1`.
4. Return `nums[lo]`.

**The subtle detail: compare with the last element, not the first.** "Is `nums[i] < nums[0]`?" also splits the two staircases. But when the array isn't rotated, it's false *everywhere*, so the first true doesn't exist and you need an extra special case. Comparing with the last element makes the unrotated case just "all true".

You may also see a version that compares `nums[mid]` with `nums[hi]` instead of the fixed last element. That's also correct, but the fixed `last` makes the yes/no question visible, which is the point of this stage.

{{code}}

## Dry run

`nums = [4, 5, 6, 7, 0, 1, 2]`, so `last = 2`, `lo = 0`, `hi = 6`:

| lo | mid | hi | nums[mid] | <= 2? | update |
|---|---|---|---|---|---|
| 0 | 3 | 6 | 7 | No | `lo = 4` |
| 4 | 5 | 6 | 1 | Yes | `hi = 5` |
| 4 | 4 | 5 | 0 | Yes | `hi = 4` |
| 4 | | 4 | | | stop |

Return `nums[4] = 0`.

Not rotated, `nums = [11, 13, 15, 17]`, so `last = 17`:

| lo | mid | hi | nums[mid] | <= 17? | update |
|---|---|---|---|---|---|
| 0 | 1 | 3 | 13 | Yes | `hi = 1` |
| 0 | 0 | 1 | 11 | Yes | `hi = 0` |
| 0 | | 0 | | | stop |

Return `nums[0] = 11`.

## Complexity

- **Time: O(log n).** Each step halves `[lo, hi]`: about 13 steps for 5000 elements.
- **Space: O(1).** A few integers.

## Edge cases and traps

- **Not rotated.** All true, so the answer is index 0. Comparing with `nums[0]` instead would break here.
- **One element.** `lo = hi = 0` from the start; the loop doesn't run, and you return `nums[0]`.
- **Two elements, like `[2, 1]`.** `last = 1`. `mid = 0`, `2 <= 1` is false, so `lo = 1`. Return 1.
- **`hi = mid - 1` when `nums[mid] <= last`.** `mid` might be the minimum itself. In the first dry run, that would skip index 4 and return 1 instead of 0.
- **Duplicates.** This problem promises distinct values. With duplicates the question isn't monotonic any more; see the follow-up.

## Say it in the interview

> "The rotated array is two increasing runs, and the minimum is the start of the second run. Every element of the second run is at most the last element, and every element of the first run is bigger than it. So 'is nums[i] at most the last element?' is false and then true, and I binary search for the first true, with hi starting at the last index because that's always true. If the array isn't rotated, everything is true and I get index 0. O(log n) time, O(1) space."

## Follow-ups interviewers ask

- **"What if there are duplicates?"** That's *Find Minimum in Rotated Sorted Array II*. With `[1, 1, 1, 0, 1]` you can't tell which run `mid` is in. The usual fix: compare with `nums[hi]`, and when they're equal, do `hi -= 1`. It's still correct, but worst case O(n).
- **"How many times was it rotated?"** The index of the minimum, `lo`, is the rotation count (mod `n`).
- **"Now search for a target."** Find the minimum first, then binary search the half that can hold the target. That's *Search in Rotated Sorted Array*, next on the path.
