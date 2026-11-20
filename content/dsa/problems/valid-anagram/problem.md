---
id: lc-242
title: Valid Anagram
pattern: Frequency counting
timeBox: 10
summary: Return true if string t uses exactly the same letters as string s, the same number of times each, in any order.
hints:
  - "Two strings are anagrams when every letter appears the same number of times in both. Order doesn't matter."
  - "If the lengths differ, you can answer immediately."
  - "Count letters with an array of 26 integers: +1 for each letter of s, −1 for each letter of t. Anagrams leave every count at zero."
insight: Anagrams are strings with identical letter counts. One 26-slot counter, incremented for s and decremented for t, must end at all zeros.
time: O(n)
space: O(1)
related: [lc-49, lc-567, lc-217]
---

## The problem in plain English

`s` and `t` are anagrams if you can rearrange the letters of one to get the other, using every letter exactly once.

- `s = "anagram"`, `t = "nagaram"` → `true`
- `s = "rat"`, `t = "car"` → `false`

Both strings contain only lowercase English letters.

## Start with brute force

**Sort both strings and compare.** If they're anagrams, sorting puts the letters in the same order, so the sorted strings are equal.

That's actually a perfectly good answer: O(n log n) time and short code. But we can do it in O(n).

## Building the intuition

What does "same letters, any order" really mean? It means **for every letter, the count in `s` equals the count in `t`**. Order is irrelevant, so we shouldn't spend time sorting.

There are only 26 lowercase letters, so a fixed array of 26 counters is all the memory we need. Map a letter to a slot with `c − 'a'` (`'a' → 0`, `'b' → 1`, …, `'z' → 25`).

## The optimal approach

1. If `len(s) != len(t)`, return `false` immediately.
2. Make `count = [0] * 26`.
3. For each position `i`: add 1 for `s[i]`, subtract 1 for `t[i]`.
4. If every slot is 0, the counts matched: return `true`. Otherwise `false`.

{{code}}

## Dry run

`s = "rat"`, `t = "car"` (only non-zero counts shown)

| i | s[i] | t[i] | counts after |
|---|---|---|---|
| 0 | r | c | r: +1, c: −1 |
| 1 | a | a | r: +1, c: −1 (a cancels out) |
| 2 | t | r | t: +1, c: −1 (r cancels out) |

`t` and `c` are non-zero, so the answer is `false`.

## Complexity

- **Time: O(n).** One pass over both strings, then a fixed 26-slot check.
- **Space: O(1).** The counter is always 26 integers, no matter how long the strings are.

## Edge cases and traps

- **Different lengths.** Early return saves work and avoids index errors in the shared loop.
- **Same letters, different counts.** `"aab"` vs `"abb"` — counting catches it, a set comparison would not.
- **Unicode.** The 26-slot trick only works for `a–z`. For any characters, use a hash map instead.

## Say it in the interview

> "Anagrams have identical character counts. Sorting both and comparing works in O(n log n). Better: since the input is lowercase letters, I keep a 26-slot counter, increment for s and decrement for t. If all counts end at zero they're anagrams. O(n) time, O(1) space. For Unicode I'd swap the array for a hash map."

## Follow-ups interviewers ask

- **"What if the strings contain Unicode?"** Use a hash map from character to count.
- **"Group many strings into anagram families?"** That's the next problem, *Group Anagrams*.
- **"Is any substring of s2 an anagram of s1?"** A sliding window of counts — *Permutation in String* in the Sliding Window stage.
