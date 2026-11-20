---
id: lc-209
title: Minimum Size Subarray Sum
pattern: Shrink while still valid
timeBox: 25
summary: Given positive numbers and a target, find the length of the shortest block of consecutive numbers whose sum is at least the target, or 0 if none exists.
hints:
  - "All the numbers are positive. If a block's sum is already at least target, what happens to the sum when you add more numbers? And when you remove one from the left?"
  - "Once a window reaches the target, extending it only makes it longer, which is worse. The only useful move is to drop numbers from the left and see if it still reaches the target."
  - "Grow right, adding to a running sum. While the sum is at least target, record the length, then subtract nums[left] and move left forward."
insight: With positive numbers, adding to a window raises its sum and removing lowers it. So grow the window until it reaches the target, then squeeze it from the left for as long as it stays valid, recording each length. Both pointers only move forward.
time: O(n)
space: O(1)
related: [cf-279b, lc-560, lc-76]
---

## The problem in plain English

You get an integer `target` and an array `nums` of **positive** integers. Find the shortest **subarray** (a block of consecutive elements) whose sum is **greater than or equal to** `target`, and return its length. If no subarray reaches `target`, return `0`.

Constraints that matter: `1 ≤ target ≤ 10⁹`, up to 10⁵ numbers, and each number is between 1 and 10⁴. Every number being positive is what makes the fast solution work.

Example: `target = 7`, `nums = [2, 3, 1, 2, 4, 3]` → `2`. The block `[4, 3]` sums to 7, and no single number reaches 7.

## Start with brute force

For every start `i`, extend the end `j` and keep a running sum. As soon as the sum reaches `target`, record `j − i + 1` and stop, because extending further only makes it longer.

That's O(n²) in the worst case. For n = 10⁵ that's 5·10⁹ steps when the target is large. The waste: after finishing start `i`, the brute force goes back to `i + 1` and adds up the same numbers again.

## Building the intuition

Think about what positivity gives you:

- adding a number on the right makes the sum **bigger**;
- removing a number on the left makes the sum **smaller**.

So the sum moves predictably as a window grows or shrinks. Now picture growing a window `[left, right]` until its sum first reaches the target. In the example that's `[2, 3, 1, 2]`, with sum 8 and length 4.

What next? Growing to the right can't help *this* left edge. The window would only get longer. The only interesting question is: **is a shorter window, ending here, still big enough?** Drop the `2` on the left: `[3, 1, 2]` sums to 6, which is too small. So stop shrinking, and grow right again.

And when you grow right later, there's no point moving `left` back. Any window starting further left and ending further right would be longer than one you've already recorded.

So both pointers only move forward. This is the variable window again, with a twist. In *Longest Substring Without Repeating Characters* you shrink while the window is **broken**, because you want it long. Here you shrink while the window is **valid**, because you want it short. In both, every window you record satisfies the invariant.

## The optimal approach

1. Set `left = 0`, `window_sum = 0`, and `best = n + 1`, a "no answer yet" value longer than any real window.
2. For each `right`:
   - `window_sum += nums[right]`;
   - while `window_sum >= target`:
     - `best = min(best, right − left + 1)`;
     - `window_sum -= nums[left]` and `left += 1`.
3. Return `0` if `best` is still `n + 1`, otherwise return `best`.

**The subtle detail:** record the length **inside** the `while` loop, before you shrink. Every time the loop runs, the window is valid, so it's a candidate. After the loop the window is too small, so recording there would be wrong. This is the mirror image of the longest-window problems, where you record after the loop.

{{code}}

## Dry run

`target = 7`, `nums = [2, 3, 1, 2, 4, 3]`

| right | Add | window_sum | Inside the while loop (record, then drop) | left after | best |
|---|---|---|---|---|---|
| 0 | 2 | 2 | — | 0 | ∞ |
| 1 | 3 | 5 | — | 0 | ∞ |
| 2 | 1 | 6 | — | 0 | ∞ |
| 3 | 2 | 8 | record 4 (0..3), drop 2 → 6 | 1 | 4 |
| 4 | 4 | 10 | record 4 (1..4), drop 3 → 7; record 3 (2..4), drop 1 → 6 | 3 | 3 |
| 5 | 3 | 9 | record 3 (3..5), drop 2 → 7; record **2** (4..5), drop 4 → 3 | 5 | **2** |

The answer is 2, from the block `[4, 3]`.

## Complexity

- **Time: O(n).** `right` moves n times, and `left` moves at most n times in total. The inner loop looks nested, but it can't run more than n times over the whole run.
- **Space: O(1).** Three integers.

The sum is at most 10⁵ × 10⁴ = 10⁹, which fits in a 32-bit int. If the limits were larger, you'd need 64 bits.

## Edge cases and traps

- **No answer.** `target = 11`, `nums = [1, 1, 1, 1, 1, 1, 1, 1]` → `0`. Don't return your sentinel.
- **One element is enough.** `target = 4`, `nums = [1, 4, 4]` → `1`.
- **`>` instead of `>=`.** The sum only has to *reach* the target.
- **Recording after the loop.** By then the window is too small, as explained above.
- **Negative numbers.** If they were allowed, shrinking could *raise* the sum and the window would break. You'd need prefix sums with a monotonic deque instead. That's why the positivity constraint matters.

## Say it in the interview

> "Because every number is positive, growing a window raises its sum and shrinking lowers it. So I use a sliding window. I add numbers on the right, and while the sum is at least target, I record the length and drop the leftmost number to try a shorter window. Both pointers only move forward, so it's O(n) time and O(1) space. If nothing ever reaches the target I return 0."

## Follow-ups interviewers ask

- **"Can you do it in O(n log n)?"** LeetCode asks for this too. Build prefix sums, which are increasing because the numbers are positive. For each start `i`, binary search for the first `j` with `prefix[j] − prefix[i] ≥ target`. It's slower than the window, but it's a good warm-up for the Binary Search stage.
- **"What if numbers can be negative?"** Then the window doesn't work. Use prefix sums plus a monotonic deque. That's LeetCode 862, Shortest Subarray with Sum at Least K.
- **"Longest subarray with sum at most t?"** The mirror version: shrink while the sum is *over* t and record after the loop. That's *Books*, the Codeforces problem in this stage.
