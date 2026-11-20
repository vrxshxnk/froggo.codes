---
id: lc-424
title: Longest Repeating Character Replacement
pattern: Window with a repaint budget
timeBox: 25
summary: You may change up to k letters of an uppercase string; return the length of the longest block of identical letters you can make.
hints:
  - "For a fixed window, which letter should you keep, and how many letters would you have to change?"
  - "A window can be made all one letter with (window length − count of its most common letter) changes. It's valid if that's at most k."
  - "Grow the window to the right and keep 26 counts. While length − maxFreq > k, shrink from the left. You never need to lower maxFreq, because only a bigger maxFreq can give a longer answer."
insight: A window is fixable when length − (count of its most common letter) ≤ k. Slide a window that grows right and shrinks left when that breaks. A stale maxFreq never causes a wrong answer, because the window then only slides at its best length so far.
time: O(n)
space: O(1)
related: [lc-3, lc-567, lc-76]
---

## The problem in plain English

You get a string `s` of uppercase English letters and an integer `k`. You may pick **at most k** positions and change each one to any uppercase letter. Afterwards, what's the longest substring (block of consecutive characters) made of one repeated letter? Return its length.

Constraints that matter: `s` has up to 10⁵ characters, and `0 ≤ k ≤ len(s)`.

Example: `s = "AABABBA"`, `k = 1` → `4`. Change the `A` at index 3 to `B` and you get `"AABBBBA"`, which contains `"BBBB"`. You could also change the `B` at index 2 to get `"AAAA"`, which is also 4.

## Start with brute force

For every substring, count its letters. It can be made uniform if `length − (count of the most common letter) ≤ k`. Keep the longest such substring.

With counts updated as the end moves, that's O(n²) substrings with O(26) work each. For n = 10⁵ that's about 5·10⁹ substrings, which is too slow.

## Building the intuition

First, a fixed window. Say you have `"AABA"` and k = 1. Which letter should everything become? The **most common** one, A, so you only repaint the minority. The cost is `length − maxCount = 4 − 3 = 1`. That's within budget, so the window is **valid**.

So the invariant is: `window length − count of its most common letter ≤ k`.

Next, notice that if a window is valid, every smaller window inside it is valid too, because removing a letter never raises the repaint cost. That's exactly the property that lets the variable window from *Longest Substring Without Repeating Characters* work. Grow `right`. If the window breaks, shrink from `left` until it's fixed. Record the length.

To check the invariant you need the most common letter's count. You can keep `count[26]` and take its max each step. That's 26 work per step, so O(26n), which is already fast enough.

### The famous shortcut

You can avoid that scan. Keep `max_freq`, the highest count any letter has reached in **any** window so far, and **never lower it**, even when the true maximum drops after a shrink.

Why is a too-high `max_freq` harmless? The answer only gets bigger when you find a window with length = `max_freq + k` for a bigger `max_freq`. While `max_freq` is stale, the condition `length − max_freq > k` makes the window shrink by exactly one each time it grows by one. So it slides along at its current length, and it never records anything longer than `best`. The moment a letter's real count beats the old `max_freq`, the window can grow again. You might report a stale window at the same length as `best`, but never a wrong, longer one.

## The optimal approach

1. Set `count = [0] * 26`, `left = 0`, `max_freq = 0` and `best = 0`.
2. For each `right`:
   - increase `count[s[right]]`, and set `max_freq = max(max_freq, count[s[right]])`;
   - while `(right − left + 1) − max_freq > k`, decrease `count[s[left]]` and do `left += 1`;
   - `best = max(best, right − left + 1)`.
3. Return `best`.

**The subtle detail:** with the never-lowered `max_freq`, the `while` loop runs at most once per step. Before you added `s[right]` the window satisfied the invariant, and adding one character breaks it by at most one. If that feels too clever, recomputing `max(count)` each step is also correct and still linear. Say so in the interview.

{{code}}

## Dry run

`s = "AABABBA"`, `k = 1`

| right | char | Counts (A, B) after adding | max_freq | Length − max_freq | Shrink? | Window | best |
|---|---|---|---|---|---|---|---|
| 0 | A | 1, 0 | 1 | 1 − 1 = 0 | no | `A` | 1 |
| 1 | A | 2, 0 | 2 | 0 | no | `AA` | 2 |
| 2 | B | 2, 1 | 2 | 1 | no | `AAB` | 3 |
| 3 | A | 3, 1 | 3 | 1 | no | `AABA` | **4** |
| 4 | B | 3, 2 | 3 | 5 − 3 = 2 | drop `A` | `ABAB` | 4 |
| 5 | B | 2, 3 | 3 | 2 | drop `A` | `BABB` | 4 |
| 6 | A | 2, 3 | 3 | 2 | drop `B` | `ABBA` | 4 |

The last row shows the stale `max_freq`. `"ABBA"` really needs 2 changes, but the window only slid along at length 4 and never beat `best`. The answer is 4.

## Complexity

- **Time: O(n).** `right` and `left` each move at most n times, and each step is O(1) (O(26) per step if you recompute the max instead).
- **Space: O(1).** A fixed array of 26 counts.

## Edge cases and traps

- **`k = 0`.** Then it's just the longest run of one letter. `"ABBB"` → 3.
- **`k ≥ n`.** You can repaint everything, so the answer is n.
- **Counting the wrong letter's frequency.** The cost uses the window's *most common* letter, not `s[right]` or `s[left]`.
- **Trying each target letter separately.** Running the window 26 times, once per letter, is correct and O(26n). It's fine, just slower to write.
- **Index math.** Use `ord(c) − ord('A')` for uppercase. The constraints say uppercase only.

## Say it in the interview

> "A window can be made all one letter with length minus its most-common-letter count changes, so it's valid when that's at most k. Shrinking a valid window keeps it valid, so I use a sliding window. I grow right, keep 26 counts, and shrink from the left while the cost goes over k, recording the best length. I keep max frequency as the best seen so far without lowering it. A stale value only makes the window slide at its current best length, so it can't produce a wrong answer. That's O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"Why is never lowering `max_freq` safe?"** The answer only grows when some letter's count reaches a new high. Until then, the stale value keeps the window length fixed at `best`, so nothing longer is ever recorded wrongly.
- **"Binary-array version: flip at most k zeros to ones?"** That's Max Consecutive Ones III. It's the same window, where the invariant is "zeros in the window ≤ k".
- **"Return the substring?"** Store `left` whenever `best` improves, and slice `s[left : left + best]`.
