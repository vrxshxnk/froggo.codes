---
id: lc-567
title: Permutation in String
pattern: Fixed-size window of letter counts
timeBox: 25
summary: Decide whether some rearrangement of s1 appears as a block of consecutive characters inside s2.
hints:
  - "A rearrangement of s1 has exactly the same letters as s1, with the same counts, and exactly the same length. What does that tell you about the size of the block you're looking for in s2?"
  - "Only blocks of length len(s1) can match. Slide a window of that size across s2 and compare letter counts. When the window moves, only two letters change."
  - "Keep need[c] = count in s1 − count in the window, and missing = how many of s1's letters the window still lacks. Adding a letter whose need is positive lowers missing; removing one that makes need positive raises it. Return true when missing hits 0."
insight: A permutation of s1 is any block of s2 with the same length and the same letter counts. Slide a fixed window of len(s1) and update the counts by one letter in and one letter out. Tracking how many letters are still missing makes each check O(1).
time: O(n)
space: O(1)
related: [lc-242, lc-76, lc-424]
---

## The problem in plain English

You get two strings of lowercase letters, `s1` and `s2`. Return `true` if `s2` contains a **permutation** (a rearrangement) of `s1` as a substring, meaning as consecutive characters. Otherwise return `false`.

Constraints that matter: each string has between 1 and 10⁴ characters. If `s1` is longer than `s2`, the answer is obviously `false`.

Example: `s1 = "ab"`, `s2 = "eidbaooo"` → `true`, because `s2` contains `"ba"`. With `s2 = "eidboaoo"` the answer is `false`. Both letters are there, but never side by side.

## Start with brute force

The literal approach generates every permutation of `s1` and searches for each one. That's m! permutations, where m = len(s1). For m = 10 that's already 3.6 million, so forget it.

A saner brute force uses the *Valid Anagram* idea. "Is this block a permutation of `s1`?" is the same as "do they have the same letter counts?" So check every block of `s2` with length m: count its letters from scratch and compare with `s1`'s counts. That's about (n − m + 1) × m steps, up to roughly 2.5·10⁷ with these limits. It passes, but each block recounts letters the previous block already counted, and with bigger inputs it would be far too slow.

## Building the intuition

Look at two neighbouring blocks of length 3 in `s2 = "dcda"`: `"dcd"` and `"cda"`. They share `"cd"`. Going from one to the next, **one letter leaves on the left and one letter enters on the right.** Everything else stays.

So don't recount. Keep the counts of the current block and update just those two letters. That's a **fixed-size sliding window**. Its length is always exactly m, and it slides one step at a time.

Now you need a quick way to answer "do the counts match?". Comparing 26 numbers each step is fine (O(26n)). But there's a neater trick, the same one *Minimum Window Substring* uses:

- `need[c]` = how many copies of `c` are in `s1`, minus how many are in the window.
- `missing` = how many of `s1`'s letters the window still lacks. It starts at m.

When a letter enters the window: if `need[c] > 0`, it fills a gap, so `missing -= 1`. Either way, `need[c] -= 1`. When a letter leaves: `need[c] += 1`, and if that makes `need[c] > 0`, you just lost a letter `s1` needed, so `missing += 1`.

`missing == 0` means the window holds every letter of `s1` with enough copies. The window is also exactly m long, so it can't hold anything extra. It's a permutation.

## The optimal approach

1. Fill `need` with the counts of `s1`. Set `missing = m`.
2. For each `right` in `s2`:
   - **add** `s2[right]`: if `need[c] > 0`, do `missing -= 1`; then `need[c] -= 1`;
   - if `right ≥ m`, **remove** `s2[right − m]`, which just fell out of the window: `need[out] += 1`, and if `need[out] > 0`, do `missing += 1`;
   - if `missing == 0`, return `true`.
3. Return `false`.

**The subtle detail:** `need[c]` can go **negative**. That means the window has extra copies of `c`. Those extras don't fill any gap, which is why `missing` only drops when `need[c]` was positive before the decrement. When a copy leaves later, `missing` only rises if `need[c]` becomes positive again, because only then has a needed copy really gone.

{{code}}

## Dry run

`s1 = "ab"` (so m = 2 and `need` is a: 1, b: 1), `s2 = "eidbaooo"`. Unlisted letters have `need` 0 before they enter.

| right | In | Out | need after (only changed letters) | missing | Window |
|---|---|---|---|---|---|
| 0 | e | — | e: −1 | 2 | `e` |
| 1 | i | — | i: −1 | 2 | `ei` |
| 2 | d | e | d: −1, e: 0 | 2 | `id` |
| 3 | b | i | b: 0, i: 0 | 1 | `db` |
| 4 | a | d | a: 0, d: 0 | **0** | `ba` → `true` |

At step 3, `b` filled a gap. At step 4, `a` filled the last one.

## Complexity

- **Time: O(n + m).** Counting `s1` is O(m). Then each character of `s2` enters once and leaves once, with O(1) work each.
- **Space: O(1).** One array of 26 counts and one integer.

## Edge cases and traps

- **`s1` longer than `s2`.** `"abc"` in `"ab"` is `false`. The loop finishes without `missing` ever reaching 0.
- **Repeated letters.** `"aab"` in `"abbab"` is `false`: every block of 3 there has one `a` and two `b`s. Counts must match, not just the set of letters.
- **Removing before the window is full.** Only remove once `right ≥ m`. Removing earlier drops letters that were never fully counted.
- **Checking before removing.** At step `right`, the window must be `s2[right − m + 1 .. right]`. Do the add and the remove first, then check.
- **Sorting each window.** Comparing sorted blocks works, but it costs O(n · m log m).

## Say it in the interview

> "A permutation of s1 is just a block of s2 with the same length and the same letter counts. So I slide a window of exactly len(s1) across s2. Each step one letter enters and one leaves, so I only update two counts. I keep need, which is s1's counts minus the window's, and a missing counter for how many of s1's letters the window still lacks. When missing hits zero the window is a permutation. That's O(n) time and O(1) space, since there are only 26 letters."

## Follow-ups interviewers ask

- **"Return every starting index of an anagram of s1 in s2?"** That's Find All Anagrams in a String. Run the same window, but record `right − m + 1` instead of returning.
- **"What if the window can be any size, and you want the shortest one containing all of s1's letters?"** That's *Minimum Window Substring*. Use the same `need`/`missing` bookkeeping with a variable window: grow until `missing == 0`, then shrink while it stays 0.
- **"Unicode or a large alphabet?"** Use a hash map instead of 26 slots. `missing` works unchanged.
