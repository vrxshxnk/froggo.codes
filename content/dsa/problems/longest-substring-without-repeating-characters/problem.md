---
id: lc-3
title: Longest Substring Without Repeating Characters
pattern: Variable sliding window with a set
timeBox: 25
summary: Find the length of the longest stretch of consecutive characters in a string where no character appears twice.
hints:
  - "Suppose s[left..right] has no repeats and you add s[right + 1]. When does the window stop being valid, and what's the smallest change that fixes it?"
  - "If the new character is already in the window, every window that still contains its old copy is invalid. Move left forward until the old copy is gone."
  - "Keep a set of the characters in the window. For each right, remove s[left] and step left forward while s[right] is in the set, then add s[right] and record right − left + 1."
insight: A window with no repeats stays valid when you shrink it. So grow it to the right one character at a time, and when the new character is a repeat, shrink from the left only until its old copy is out. Each index enters and leaves the window once, so it's O(n).
time: O(n)
space: O(min(n, k))
related: [lc-424, lc-567, lc-76]
---

## The problem in plain English

You get a string `s`. A **substring** is a block of consecutive characters, so `"wke"` is a substring of `"pwwkew"` but `"pwke"` is not (that's a *subsequence*). Return the length of the longest substring in which every character is different.

Constraints that matter: `s` has up to 5·10⁴ characters, which can be letters, digits, symbols and spaces. It can also be empty.

Example: `s = "pwwkew"` → `3`. Both `"wke"` and `"kew"` have no repeats. Nothing of length 4 works.

## Start with brute force

For every start `i`, extend the end `j` one character at a time, keeping a set of what you've seen. Stop as soon as `s[j]` is already in the set, because every longer substring from `i` has the same repeat. Track the longest.

That's O(n²) time in the worst case. For n = 5·10⁴ that's up to 2.5·10⁹ steps, which is too slow. The waste is easy to spot: when you move from start `i` to start `i + 1`, you throw the set away and rebuild almost the same thing.

## Building the intuition

Take `"abcabcbb"`. From start 0 the brute force reads `a, b, c`, then hits the second `a` and stops. Then it starts again at index 1 and reads `b, c, a`... But it already knew `"bc"` had no repeats. Why read it again?

Here's the key fact: **if a window has no repeats, every smaller window inside it has no repeats either.** So when you can't extend a window, you don't need to start over. Just drop characters from the **left** until the window is valid again, then keep extending to the right.

How much do you drop? When the new character `c` is already in the window, the window is broken *because of the old copy of `c`*. Any window that still includes that old copy is broken too. So move `left` forward, removing characters from the set, until the old `c` has left. Then add the new `c`.

So you have two pointers that only ever move forward, and a set describing exactly what's between them. The rule that's always true between steps is called the **invariant**. Here it's "the window `s[left..right]` has no repeats". Grow right, and shrink left while the invariant is broken. That's the variable sliding window, the main template of this stage.

## The optimal approach

1. Set `window = {}` (a set), `left = 0` and `best = 0`.
2. For each `right` with character `c = s[right]`:
   - while `c` is in `window`, remove `s[left]` from `window` and do `left += 1`;
   - add `c` to `window`;
   - `best = max(best, right − left + 1)`.
3. Return `best`.

**The subtle detail:** the `while` loop removes characters that are *not* `c` too. In `"pwwkew"`, when the second `w` arrives at index 2 the window is `"pw"`. You must remove `p` first and then the old `w`. You can't jump past a repeat without also giving up everything before it, because a substring must be contiguous.

{{code}}

## Dry run

`s = "pwwkew"`

| right | c | Shrinking (removed) | left | window after | Length | best |
|---|---|---|---|---|---|---|
| 0 | p | — | 0 | {p} | 1 | 1 |
| 1 | w | — | 0 | {p, w} | 2 | 2 |
| 2 | w | remove `p`, then `w` | 2 | {w} | 1 | 2 |
| 3 | k | — | 2 | {w, k} | 2 | 2 |
| 4 | e | — | 2 | {w, k, e} | 3 | **3** |
| 5 | w | remove `w` (index 2) | 3 | {k, e, w} | 3 | 3 |

The answer is 3.

## Complexity

- **Time: O(n).** `right` moves n times. `left` also moves at most n times in total over the whole run, since it never moves back. Each set operation is O(1) on average. So it's O(2n) = O(n).
- **Space: O(min(n, k))**, where k is the size of the character set (at most 128 for ASCII). The window never holds two copies of anything.

## Edge cases and traps

- **Empty string.** `""` → `0`. The loop never runs.
- **A single space.** `" "` → `1`. Spaces are characters too.
- **`"abba"`.** At the second `b`, you remove `a` and `b`. At the final `a`, the window is `{b}`, so `a` isn't in it. The answer is 2. This trips up the "jump to last index" version (see the follow-ups).
- **`if` instead of `while`.** Removing just one character on a repeat is wrong whenever the old copy isn't the leftmost character, as in `"pww"`.
- **Recording before fixing.** Update `best` only after the window is valid again.

## Say it in the interview

> "I'll keep a sliding window with no repeated characters, plus a set of what's inside it. I move right one character at a time. If the new character is already in the set, I shrink from the left, removing characters until its old copy is gone. Then I add it and record the window length. Both pointers only move forward, so it's O(n) time, and the set holds at most one copy of each character."

## Follow-ups interviewers ask

- **"Can you skip the inner loop?"** Store each character's last index in a map. On a repeat, jump `left = max(left, last[c] + 1)`. The `max` matters: in `"abba"`, the final `a`'s last index is behind `left`, and without `max` the window would move backwards.
- **"At most k distinct characters instead of none repeated?"** Same window, but keep counts in a map and shrink while the map has more than k keys.
- **"Smallest window containing all of t's characters?"** That's *Minimum Window Substring* in the bonus Hard DP & The Gauntlet stage. It's the same grow and shrink, but you shrink while the window is *valid*, to make it as short as possible.
