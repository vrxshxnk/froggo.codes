---
id: lc-34
title: Find First and Last Position of Element in Sorted Array
pattern: Lower bound plus upper bound
timeBox: 25
summary: In a sorted array that may contain repeats, return the first and last index of a target, or [-1, -1] if it's missing, in O(log n) time.
hints:
  - "Finding one copy of the target and then walking left and right is O(n) when the array is full of copies. Can binary search land exactly on the first copy?"
  - "The first copy is the first index with nums[i] >= target. What yes/no question would land you just past the last copy?"
  - "Run the template twice: once with nums[mid] >= target (the lower bound, the first copy) and once with nums[mid] > target (the upper bound, one past the last copy). If the lower bound doesn't hold the target, return [-1, -1]; otherwise return [lower, upper - 1]."
insight: The first copy of the target is the lower bound (first nums[i] >= target), and one past the last copy is the upper bound (first nums[i] > target). Two binary searches that differ by one character give both ends in O(log n).
time: O(log n)
space: O(1)
related: [lc-704, cf-706b, lc-33]
---

## The problem in plain English

You get an array `nums` sorted in non-decreasing order, so **repeats are allowed**, and a `target`. Return `[first, last]`: the first and last index where `target` appears. If it doesn't appear, return `[-1, -1]`. Your solution must run in O(log n) time. The array can be empty and has up to 10⁵ elements.

Example: `nums = [5, 7, 7, 8, 8, 10]`, `target = 8` → `[3, 4]`. With `target = 6`, the answer is `[-1, -1]`.

## Start with brute force

Scan from the left for the first copy, and from the right for the last copy. That's O(n).

A tempting "fix" is to binary search for *any* copy, then walk outwards while the neighbours are equal. That's O(log n) to find one copy, but if the array is 10⁵ copies of the same number, the walk is 10⁵ steps. Still O(n) in the worst case.

## Building the intuition

Don't search for "a copy". Search for a **boundary**. Write the two yes/no questions from the primer under the example, with `target = 8`:

| i | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| nums[i] | 5 | 7 | 7 | 8 | 8 | 10 |
| nums[i] >= 8? | F | F | F | **T** | T | T |
| nums[i] > 8? | F | F | F | F | F | **T** |

Both rows are falses-then-trues, so binary search can find the first T in each.

- The first T of `>= 8` is index 3, the **first copy**. That's the lower bound.
- The first T of `> 8` is index 5, the first number **past** all the 8s. That's the upper bound. The last copy is one before it: index 4.

So the whole problem is two runs of the same template, changing `>=` to `>`. That's it. And if the target is missing, the lower bound lands on something that isn't the target (or past the end), which you can check.

## The optimal approach

1. **Lower bound.** `lo = 0`, `hi = n`. While `lo < hi`: `mid = lo + (hi - lo) // 2`; if `nums[mid] >= target`, `hi = mid`, else `lo = mid + 1`. Call the result `first`.
2. **Missing?** If `first == n` or `nums[first] != target`, return `[-1, -1]`.
3. **Upper bound.** Same loop from `lo = 0`, `hi = n`, but with `nums[mid] > target`. Call the result `upper`.
4. Return `[first, upper - 1]`.

**The subtle detail: the upper bound is one *past* the last copy.** It's the first index that is strictly bigger, so you must subtract 1. Forgetting the `- 1` is the most common bug here. Also, the second search can't land on `n` "by accident" and break anything: `upper = n` just means the copies run to the end of the array, so `upper - 1 = n - 1` is correct.

Some people do the second search with `>= target + 1`. For integers that's the same question, but `target + 1` can overflow when `target` is the largest `int`. Writing `>` avoids that.

{{code}}

## Dry run

`nums = [5, 7, 7, 8, 8, 10]`, `target = 8`, `n = 6`.

**Lower bound** (`nums[mid] >= 8?`):

| lo | mid | hi | nums[mid] | >= 8? | update |
|---|---|---|---|---|---|
| 0 | 3 | 6 | 8 | Yes | `hi = 3` |
| 0 | 1 | 3 | 7 | No | `lo = 2` |
| 2 | 2 | 3 | 7 | No | `lo = 3` |
| 3 | | 3 | | | `first = 3` |

`nums[3] = 8`, so the target is present.

**Upper bound** (`nums[mid] > 8?`):

| lo | mid | hi | nums[mid] | > 8? | update |
|---|---|---|---|---|---|
| 0 | 3 | 6 | 8 | No | `lo = 4` |
| 4 | 5 | 6 | 10 | Yes | `hi = 5` |
| 4 | 4 | 5 | 8 | No | `lo = 5` |
| 5 | | 5 | | | `upper = 5` |

Return `[3, 5 - 1] = [3, 4]`.

Look at the first row of each table. `mid = 3` holds an 8 both times. The lower bound treats it as "yes, keep looking left", while the upper bound treats it as "no, keep looking right". That one-character difference is what steers each search to its own end of the run of 8s.

## Complexity

- **Time: O(log n).** Two binary searches of about log₂ n steps each, 17 apiece for 10⁵ elements, no matter how many copies there are.
- **Space: O(1).** A few integers.

## Edge cases and traps

- **Empty array.** `n = 0`, so the first loop doesn't run and `first = 0 = n`. The missing check returns `[-1, -1]`, and you never read `nums[0]`.
- **Forgetting `upper - 1`.** Returns `[3, 5]` for the example. The upper bound is past the last copy.
- **Target smaller or bigger than everything.** The lower bound lands on 0 or `n`, and the missing check catches both.
- **Every element is the target.** `first = 0` and `upper = n`, so you return `[0, n - 1]`. The "find one, then walk" approach would take O(n) here.
- **Reading `nums[first]` without checking `first < n`.** Crashes when the target is bigger than every element.

## Say it in the interview

> "I don't look for a copy of the target. I look for the two boundaries. The first copy is the lower bound: the first index where nums[i] is at least the target. One past the last copy is the upper bound: the first index where nums[i] is strictly greater. Both questions are false then true, so each is one binary search with the same loop, only the comparison changes. If the lower bound doesn't hold the target, I return minus one, minus one. Otherwise it's lower bound and upper bound minus one. O(log n) time, O(1) space."

## Follow-ups interviewers ask

- **"How many times does the target appear?"** `upper - first`. Still O(log n), even if the answer is 10⁵.
- **"Can you skip part of the second search?"** Yes: start it at `lo = first`, since everything before `first` is smaller than the target. Same big-O.
- **"Find the number of elements in a range [a, b]."** Upper bound of `b` minus lower bound of `a`. You used the same idea in *Interesting Drink*, where the upper bound is the count of prices `<= m`.
