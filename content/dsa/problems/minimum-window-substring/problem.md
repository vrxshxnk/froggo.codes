---
id: lc-76
title: Minimum Window Substring
pattern: Variable sliding window + counts
timeBox: 40
summary: Find the shortest stretch of s that contains every character of t, counting duplicates.
hints:
  - "If a window [left, right] contains all of t, then every longer window that also contains it does too. So for each right end, you only care about the largest left that still works."
  - "Grow the window with right until it covers t. Then shrink it from the left for as long as it still covers t, recording the size each time."
  - "Keep need[c] = how many more copies of c the window still owes, plus one number, missing = total characters still owed. A character only changes missing when it moves need[c] across zero. The window is valid exactly when missing == 0."
insight: Expand the right edge until the window covers t, then shrink the left edge while it still does. One counter (missing) tells you in O(1) whether the window is valid, so each pointer moves at most n times.
time: O(m + n)
space: O(1)
related: [lc-3, lc-567, lc-424, lc-209]
---

## The problem in plain English

You get two strings, `s` (length `m`) and `t` (length `n`). Find the **shortest substring** of `s` that contains every character of `t`, **including duplicates**. If `t` has two `a`s, the window needs at least two `a`s. Return that substring, or `""` if none exists. The test data guarantees the answer is unique.

Upper- and lower-case letters are different characters. Lengths go up to 10⁵.

Example: `s = "ADOBECODEBANC"`, `t = "ABC"` → `"BANC"`. Other windows such as `"ADOBEC"` also contain A, B and C, but `"BANC"` is the shortest.

## Start with brute force

Try every start `i`. Extend the end `j` one step at a time, keeping counts, and stop at the first `j` where the window covers `t`. That's the shortest window starting at `i`. Keep the best one overall.

That's O(m²) windows in the worst case, and each check over the alphabet costs extra. For `m = 10⁵`, that's 10¹⁰ steps. Too slow.

## Building the intuition

This Hard is two Medium ideas stacked together: **the variable-size sliding window** from *Longest Substring Without Repeating Characters*, and **frequency counting** from *Permutation in String*. The new part is noticing which way the window should move.

**Step 1: a monotone property.** Suppose `s[2..9]` covers `t`. Then `s[2..10]`, `s[1..9]` and any window that contains `s[2..9]` also cover `t`. Adding characters never breaks coverage. Removing characters can.

That's the signal for a sliding window. For a fixed right end, the valid left ends form a run `0, 1, …, L`. You want the biggest `L`, because that gives the shortest window. And when the right end moves forward, the best `L` can only move forward too. So **neither pointer ever needs to move backwards**.

**Step 2: what does each pointer do?**

- Move `right` forward until the window covers `t` (grow).
- Then move `left` forward while the window *still* covers `t`, recording the length each time (shrink).
- The moment it stops covering `t`, go back to growing.

**Step 3: checking "covers t" in O(1).** Comparing two count arrays costs O(alphabet) every step. Instead, keep:

- `need[c]`: how many more copies of `c` the window owes. It starts as the count of `c` in `t`. It goes negative when the window has spares.
- `missing`: the total number of characters still owed. It starts at `len(t)`.

When `c` enters the window: if `need[c] > 0`, that copy was really needed, so `missing -= 1`. Either way, `need[c] -= 1`.
When `c` leaves: `need[c] += 1`, and if `need[c]` is now `> 0`, you just gave away a needed copy, so `missing += 1`.

The window covers `t` exactly when `missing == 0`.

## The optimal approach

1. Fill `need` from `t` (an array of 128 slots covers ASCII). Set `missing = len(t)`.
2. For each `right` from 0 to `m − 1`:
   - take `s[right]`: if `need[c] > 0`, decrement `missing`; then decrement `need[c]`;
   - while `missing == 0`: record the window if it's the shortest so far, then drop `s[left]` (increment its `need`, and increment `missing` if it went above 0), then `left += 1`.
3. Return the best window, or `""` if none was ever recorded.

**The subtle detail: why negative counts are fine.** `need['B'] = −1` means the window holds one spare `B`. When a `B` leaves, `need` goes back to 0. That's still not positive, so `missing` stays put, which is right: you only lost a spare. This is how duplicates in `t` work with no extra code.

{{code}}

## Dry run

`s = "ADOBECODEBANC"`, `t = "ABC"`. Only the moments where something interesting happens are shown.

| right | char | missing after | Shrinking | Best so far |
|---|---|---|---|---|
| 0 | A | 2 | — | — |
| 3 | B | 1 | — | — |
| 5 | C | **0** | record `[0, 5]` "ADOBEC" (6). Drop A → missing 1, left = 1 | ADOBEC |
| 9 | B | 1 | spare B: `need[B] = −1`, missing unchanged | ADOBEC |
| 10 | A | **0** | `[1, 10]` (10) is no better. Drop D, O, B (spare), E. At `[5, 10]` the length is 6, which doesn't beat 6. Drop C → missing 1, left = 6 | ADOBEC |
| 12 | C | **0** | Drop O, D, E: `[9, 12]` "BANC" (4) is the new best. Drop B → missing 1, left = 10 | **BANC** |

Each character entered the window once and left at most once.

## Complexity

- **Time: O(m + n).** Building `need` reads `t` once. Then `right` moves `m` times and `left` moves at most `m` times in total, across all iterations. The inner `while` is not a nested loop in cost terms.
- **Space: O(1).** The `need` array has a fixed 128 slots, whatever the input size. (With a hash map it's O(k) for k distinct characters.)

## Edge cases and traps

- **`t` longer than `s`, or a character missing from `s`.** `missing` never reaches 0, so nothing is recorded. Return `""`.
- **Duplicates in `t`**, like `s = "a"`, `t = "aa"` → `""`. Counting per character, not just presence, is what makes this work. A set would wrongly return `"a"`.
- **Recording after the shrink loop.** Record *inside* the `while`, before you drop `s[left]`. If you record after the loop, the window is already invalid.
- **Storing the substring every time.** Building `s[left:right+1]` inside the loop makes each record cost O(m). Store `bestStart` and `bestLen`, and slice once at the end.
- **Case sensitivity.** `'A'` and `'a'` are different. Index by character code, not by `c - 'a'`.

## Say it in the interview

> "Coverage is monotone. If a window covers t, any window containing it does too. So I use a sliding window. I grow the right edge until the window covers t, then shrink the left edge while it still does, recording the shortest. To check coverage in O(1), I keep need-counts per character and one counter called missing. A character only changes missing when its need crosses zero. Both pointers move forward at most m times, so it's O(m + n) time and O(1) space for a fixed alphabet."

## Follow-ups interviewers ask

- **"What if t is tiny but s is huge, with most characters irrelevant?"** First build a filtered list of `(index, char)` for only the characters that appear in `t`. Then slide over that list. It's the same complexity, but much faster in practice.
- **"Count characters as a set: ignore duplicates in t."** Initialise `need[c] = 1` for each distinct `c`, and `missing` = the number of distinct characters. Nothing else changes.
- **"Find the shortest subsequence of s containing t in order instead."** That's a different problem (LeetCode 727). It needs DP or a two-direction scan, because order breaks the counting trick.
