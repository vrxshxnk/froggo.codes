---
id: cf-279b
title: Books
pattern: Longest window with sum at most t
timeBox: 25
summary: Given reading times for books on a shelf and t free minutes, find the most consecutive books you can finish if you start at any book and read in order.
hints:
  - "Starting at book i and reading in order means you read a block of consecutive books. What condition must that block satisfy?"
  - "You want the longest block whose total time is at most t. All times are positive, so adding a book raises the total and dropping one lowers it."
  - "Slide a window. Add book right to a running sum. While the sum is over t, subtract a[left] and move left forward. Record right − left + 1."
insight: Reading from some book onwards is just a contiguous block, so you want the longest block with sum ≤ t. Positive times mean the window can grow right and shrink left, each pointer moving forward only, for O(n).
time: O(n)
space: O(n)
related: [lc-209, lc-3, lc-560]
---

## The problem in plain English

There are `n` books on a shelf, in order. Book `i` takes `a[i]` minutes to read. You have `t` free minutes. You pick **any** book to start with, then read books one after another to the right. You only count books you finish completely, and you stop when the next book won't fit in the time left, or the shelf runs out. What's the maximum number of books you can read?

**Input:** the first line has `n` and `t`. The second line has `a[1] … a[n]`.
**Output:** one integer, the maximum number of books.

Constraints that matter: `1 ≤ n ≤ 10⁵`, `1 ≤ t ≤ 10⁹`, `1 ≤ a[i] ≤ 10⁴`. All the times are positive.

Example: `n = 4`, `t = 5`, `a = [3, 1, 2, 1]` → `3`. Start at the second book and read `1 + 2 + 1 = 4` minutes' worth. Starting at the first gives `3 + 1 = 4` and then the 2-minute book won't fit, so that's only 2 books.

In other words: **find the longest block of consecutive numbers whose sum is at most `t`.** The answer can be `0`, if every single book is longer than `t`.

## Start with brute force

For each start `i`, keep adding books while the total stays within `t`, and track the longest run.

In the worst case, where `t` is huge and every run reaches the end of the shelf, that's n²/2 = 5·10⁹ additions for n = 10⁵. Codeforces gives you about a second, which is roughly 10⁸ simple operations. So that's too slow.

## Building the intuition

Watch the brute force on `[3, 1, 2, 1]` with `t = 5`. From book 0 it reads `3, 1` (sum 4), then sees the 2 won't fit. Then it starts over from book 1 and re-adds the `1`, which it already knew about.

Think of it as a window instead. You were reading books 0..1 and couldn't add book 2. You don't need to start over. Just **give up the first book** (subtract 3), and now the window `1..1` has room. Add book 2 and you're at sum 3. Add book 3 and you're at sum 4, which is a window of 3 books.

Two facts make this safe:

1. **Times are positive**, so dropping a book always frees up time, and adding one always uses time.
2. **If a block fits, any smaller block inside it fits too.** So once the block `left..right` is too long, no window that starts at `left` and ends at `right` or later can fit. `left` is finished, and you move it forward.

That's the variable window template exactly. Invariant: the window's total is at most `t`. Grow right. While the invariant is broken, shrink left. Then record the length.

It's the same machine as *Minimum Size Subarray Sum*, flipped. There you want the **shortest** window with sum **≥** target, so you shrink while the window is valid. Here you want the **longest** window with sum **≤** t, so you shrink while it's invalid.

## The optimal approach

1. Read `n`, `t` and the array `a`. Set `left = 0`, `window_sum = 0` and `best = 0`.
2. For each `right` from 0 to n − 1:
   - `window_sum += a[right]`;
   - while `window_sum > t`: `window_sum -= a[left]` and `left += 1`;
   - `best = max(best, right − left + 1)`.
3. Print `best`.

**The subtle detail:** if one book alone is longer than `t`, the `while` loop removes that book too, and `left` ends up at `right + 1`. The window is then empty, with length `right − left + 1 = 0`. That's still correct: `best` simply isn't improved, and if no book fits at all, the answer is 0. You don't need a special case.

{{code}}

## Dry run

`n = 4`, `t = 5`, `a = [3, 1, 2, 1]`

| right | Add | window_sum | Shrink while > 5 | left | Window | best |
|---|---|---|---|---|---|---|
| 0 | 3 | 3 | — | 0 | books 0..0 | 1 |
| 1 | 1 | 4 | — | 0 | books 0..1 | 2 |
| 2 | 2 | 6 | drop 3 → 3 | 1 | books 1..2 | 2 |
| 3 | 1 | 4 | — | 1 | books 1..3 | **3** |

The answer is 3.

## Complexity

- **Time: O(n).** `right` moves n times, and `left` moves at most n times in total, because it never goes back.
- **Space: O(n)** to store the input. The window itself is O(1): two indices and a sum.

The sum stays at most `t` after shrinking, and at most `t + 10⁴` just before. That fits in 32 bits, but `long long` / `long` costs nothing and protects you if the limits change.

## Edge cases and traps

- **No book fits.** `n = 1`, `t = 1`, `a = [2]` → `0`. The empty-window logic handles it.
- **The whole shelf fits.** If the total is ≤ t, the answer is `n`. One test has 10⁵ books of 10⁴ minutes and `t = 10⁹`. The total is exactly `t`, so all 10⁵ books fit.
- **`>=` instead of `>`.** Finishing exactly at `t` is allowed. Shrink only while the sum is strictly greater than `t`.
- **Slow input.** 10⁵ numbers is fine in C++ with `ios::sync_with_stdio(false)`. In Java, use a fast reader instead of `Scanner`, and in Python read everything with `sys.stdin`.
- **Thinking you must start at book 1.** You may start anywhere. That's what makes it a window problem rather than a simple prefix scan.

## Say it in the interview

> "Starting anywhere and reading in order means I'm choosing a contiguous block, so I want the longest block with sum at most t. All times are positive, so I use a sliding window. I add the book on the right, and while the total goes over t I drop books from the left. Then I record the window's length. Both pointers only move forward, so it's O(n), with O(1) extra memory beyond the input."

## Follow-ups interviewers ask

- **"Do it with binary search instead."** The prefix sums are strictly increasing because the times are positive. For each start `i`, binary search for the furthest end with `prefix[j] − prefix[i] ≤ t`. That's O(n log n), and it's a nice preview of the Binary Search stage.
- **"What if the shelf is circular?"** Concatenate the array with itself and run the same window, but cap the window length at `n`.
- **"Shortest block with sum at least t?"** That's *Minimum Size Subarray Sum*, the next problem. It's the same window, but you shrink while the window is valid.
