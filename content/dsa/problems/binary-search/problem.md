---
id: lc-704
title: Binary Search
pattern: Lower bound on a sorted array
timeBox: 15
summary: Find the position of a target in a sorted array of distinct numbers, or return -1 if it isn't there, in O(log n) time.
hints:
  - "The array is sorted. If the middle element is smaller than the target, which half can never contain the target?"
  - "Instead of asking 'is this the target?', ask a yes/no question that is false on the left part of the array and true on the right part: is nums[i] >= target?"
  - "Find the first index where nums[i] >= target, using lo = 0 and hi = n. If that index is inside the array and holds the target, return it. Otherwise return -1."
insight: Because the array is sorted, "nums[i] >= target" is false for a prefix and true for the rest. Binary search finds the first true index in O(log n), and the target is either sitting there or nowhere.
time: O(log n)
space: O(1)
related: [lc-34, lc-74, lc-33]
---

## The problem in plain English

You get an array `nums` sorted in increasing order, with no repeated values, and a number `target`. Return the index of `target` in `nums`, or `-1` if it isn't there. The catch: your solution must run in **O(log n)** time.

Sizes: up to 10⁴ numbers, values between −10⁴ and 10⁴.

Example: `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9` → `4`, because `nums[4] = 9`. With `target = 2` the answer is `-1`.

## Start with brute force

Walk the array from left to right and return the first index where `nums[i] == target`. It's obviously correct and takes O(n) time.

For 10⁴ numbers that's fast enough on a computer, but it ignores the one thing the problem gave you: the array is **sorted**. The problem asks for O(log n) because that's about 14 steps for 10⁴ numbers instead of 10⁴. And the same idea will later search a range of 10⁹ possible answers in 30 steps, where a scan is hopeless.

## Building the intuition

Think about how you find a word in a paper dictionary. You don't read page 1, then page 2. You open somewhere in the middle, see "M", and know your word "cat" is in the left half. One look threw away half the book.

Try it on the example. Look at the middle, `nums[3] = 5`. The target is 9. Since the array is sorted, everything at index 3 or before is at most 5, so the target can't be there. Half gone.

Now make that precise. Ask, for each index, the yes/no question **"is `nums[i] >= target`?"** For `target = 9`:

| i | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| nums[i] | −1 | 0 | 3 | 5 | 9 | 12 |
| nums[i] >= 9? | F | F | F | F | **T** | T |

Because the array is sorted, the answers are always a run of falses followed by a run of trues. If the target exists, it sits exactly at the **first T**. If it doesn't, the first T holds a bigger number, or there is no T at all. So the problem becomes: find the first T. That's exactly what the template from the primer does.

## The optimal approach

1. Set `lo = 0` and `hi = n`. Index `n` is past the end; treat it as a "true" slot that means "every element is smaller than the target".
2. While `lo < hi`:
   - `mid = lo + (hi - lo) // 2`.
   - If `nums[mid] >= target`, the first T is at `mid` or to its left: `hi = mid`.
   - Otherwise, `mid` and everything left of it are too small: `lo = mid + 1`.
3. Now `lo == hi` is the first index with `nums[lo] >= target`, the **lower bound**.
4. If `lo < n` and `nums[lo] == target`, return `lo`. Otherwise return `-1`.

**The subtle detail: step 4 needs both checks.** If the target is bigger than everything, the loop ends at `lo = n`, and reading `nums[n]` crashes, so test `lo < n` first. If the target falls between two values, `lo` points at the next bigger number, so test `nums[lo] == target` too.

You may have seen another version that uses `while lo <= hi` and returns as soon as `nums[mid] == target`. It works here, but it can't find the *first* of several equal values, and it's a second loop to keep straight. This stage uses one loop everywhere.

{{code}}

## Dry run

`nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`, so `n = 6`:

| lo | mid | hi | nums[mid] | nums[mid] >= 9? | update |
|---|---|---|---|---|---|
| 0 | 3 | 6 | 5 | No | `lo = 4` |
| 4 | 5 | 6 | 12 | Yes | `hi = 5` |
| 4 | 4 | 5 | 9 | Yes | `hi = 4` |
| 4 | | 4 | | | stop |

`lo = 4`, which is inside the array, and `nums[4] = 9`. Return `4`.

Now `target = 2`:

| lo | mid | hi | nums[mid] | nums[mid] >= 2? | update |
|---|---|---|---|---|---|
| 0 | 3 | 6 | 5 | Yes | `hi = 3` |
| 0 | 1 | 3 | 0 | No | `lo = 2` |
| 2 | 2 | 3 | 3 | Yes | `hi = 2` |
| 2 | | 2 | | | stop |

`lo = 2`, but `nums[2] = 3`, not 2. Return `-1`. Notice the loop didn't stop early at the third row, even though `nums[mid] = 3` was "close". It always runs until `lo == hi`.

## Complexity

- **Time: O(log n).** Every step at least halves the size of `[lo, hi]`. Starting from `n + 1` candidates, that's about log₂ n steps: 14 for 10⁴.
- **Space: O(1).** Three integers, no matter how big the array is.

## Edge cases and traps

- **Target bigger than every element.** The loop ends at `lo = n`. Check `lo < n` *before* reading `nums[lo]`.
- **Target smaller than every element.** The loop ends at `lo = 0`, and `nums[0]` is bigger than the target, so the equality check returns `-1`.
- **One element.** `lo = 0`, `hi = 1`: one step, then the check. Works with no special case.
- **`hi = mid - 1` when `nums[mid] >= target`.** That throws away `mid`, which may be the target. With this template, a true `mid` always becomes `hi`.
- **`(lo + hi) / 2` in C++ or Java.** Here values are small, but get used to `lo + (hi - lo) / 2`. It matters in *Koko Eating Bananas*.

## Say it in the interview

> "Since the array is sorted, the question 'is nums[i] at least the target?' is false for a prefix and true for the rest. I binary search for the first index where it's true, with lo at 0 and hi at n, which stands for 'past the end'. When the true case happens I set hi to mid, and otherwise lo to mid plus one, so the answer always stays in the range. When they meet, I check that the index is in bounds and actually holds the target. That's O(log n) time and O(1) space."

## Follow-ups interviewers ask

- **"What if the array has duplicates and you need the first one?"** This code already returns the first, because it finds the lower bound. For the last one, see *Find First and Last Position of Element in Sorted Array*.
- **"What if the target isn't there and you must return where it would be inserted?"** Return `lo` directly. It's the insertion point that keeps the array sorted.
- **"Can you do it recursively?"** Yes, but each call adds a stack frame, so space becomes O(log n). The loop is simpler and uses O(1).
