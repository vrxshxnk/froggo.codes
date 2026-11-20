---
id: lc-139
title: Word Break
pattern: Yes/no DP on prefixes
timeBox: 25
summary: Decide whether a string can be chopped into pieces that are all words from a given dictionary.
hints:
  - "Trying every way to cut the string is exponential. But notice: once you know a prefix can be split, you never care how it was split."
  - "Think about the last word of the split. If the last word is w, the part before it must itself be splittable."
  - "Let dp[i] be true when the first i characters can be split. dp[0] = true. dp[i] is true if some word w ends exactly at position i and dp[i − len(w)] is true."
insight: A prefix can be split exactly when some dictionary word ends it and the shorter prefix before that word can be split. Store the yes/no answer for every prefix length, from 0 up.
time: O(n · m · k)
space: O(n)
related: [lc-322, lc-70, lc-208]
---

## The problem in plain English

You get a string `s` and a list of words `wordDict`. Return `true` if you can cut `s` into one or more pieces so that **every piece is a word from the list**. You can use a word as many times as you like, and you don't have to use every word.

`s` has 1 to 300 lowercase letters. The list has 1 to 1000 distinct words, each 1 to 20 letters. Below, `n = len(s)`, `m` is the number of words and `k` is the longest word's length.

Example: `s = "applepenapple"`, `wordDict = ["apple", "pen"]` → `true`, because it splits as `apple | pen | apple`.

## Start with brute force

Try every way to cut the string. Between each pair of neighbouring characters you either cut or you don't, so there are 2ⁿ⁻¹ ways. Check each one against the dictionary.

With `n = 300` that's about 10⁹⁰ ways. A smarter recursion ("try each word as the first piece, then recurse on the rest") still blows up on inputs like `"aaaa…ab"` with words `"a"`, `"aa"`, `"aaa"`: it explores a huge number of splits of the `a`s, and every one fails at the `b`.

## Building the intuition

Look at what that recursion actually asks. On `"aaaa…ab"` it asks "can the rest, starting at position 7, be split?" many times, once for every way of splitting the first 7 characters. The answer never changes. **How you split the beginning doesn't matter, only where it ended.**

So the question depends on one number, a position. Store one yes/no answer per position. Walk through the recipe:

1. **State.** `dp[i]` means *the first `i` characters, `s[0:i]`, can be split into dictionary words*.
2. **Recurrence.** Think about the **last word** of the split. If the last word is `w`, then `s[0:i]` must end with `w`, and the part before it, `s[0:i − len(w)]`, must be splittable. So `dp[i]` is true when some word `w` has `dp[i − len(w)]` true and `s` has `w` ending exactly at position `i`.
3. **Base case.** `dp[0] = true`. The empty prefix is split into zero words. Without this, no first word could ever start.
4. **Order.** `dp[i]` reads smaller indices only, so fill `i` from 1 to `n`. The answer is `dp[n]`.

This is the same shape as *Coin Change*: there, the last coin left an amount to make; here, the last word leaves a prefix to split.

## The optimal approach

1. Make `dp` of size `n + 1`, all false. Set `dp[0] = true`.
2. For `i` from 1 to `n`, for each word `w` of length `L`:
   - if `L ≤ i`, `dp[i − L]` is true, and `s` has `w` starting at `i − L`, set `dp[i] = true` and stop trying words for this `i`.
3. Return `dp[n]`.

**The subtle detail: check `dp[i − L]` before comparing strings.** The string comparison costs up to `k` steps; the table lookup costs one. Testing the cheap condition first skips most comparisons. And `break` as soon as one word works: you only need one way.

**Another way to write step 2:** put the words in a hash set and, for each `i`, try every start `j` from `i − k` to `i − 1`, checking `dp[j]` and whether `s[j:i]` is in the set. Same idea; looping over words is simpler and avoids building substrings.

**Space.** One 1D table, and any earlier cell may be needed later, so there's nothing to squeeze.

{{code}}

## Dry run

`s = "catsanddog"`, `wordDict = ["cat", "cats", "and", "sand", "dog"]`. Positions are counted in characters: `dp[4]` is about `"cats"`.

| i | prefix `s[0:i]` | word that ends here and fits | checks `dp[i − L]` | dp[i] |
|---|---|---|---|---|
| 0 | `""` | — | — | **T** (base) |
| 1 | `c` | none | — | F |
| 2 | `ca` | none | — | F |
| 3 | `cat` | `cat` | `dp[0]` = T | **T** |
| 4 | `cats` | `cats` | `dp[0]` = T | **T** |
| 5 | `catsa` | none (`dp[2]`, `dp[1]` are F) | — | F |
| 6 | `catsan` | none (`san` isn't a word, `dp[2]` is F) | — | F |
| 7 | `catsand` | `and` | `dp[4]` = T | **T** |
| 8 | `catsandd` | none | — | F |
| 9 | `catsanddo` | none | — | F |
| 10 | `catsanddog` | `dog` | `dp[7]` = T | **T** |

Final table: `dp = [T, F, F, T, T, F, F, T, F, F, T]`. `dp[10]` is true: `cats | and | dog`. (At `i = 7`, `sand` with `dp[3]` would also have worked; `and` was tried first and the loop stopped.)

## Complexity

- **Time: O(n · m · k).** For each of the `n` positions, try `m` words, and a comparison costs up to `k`. At most 300 × 1000 × 20 = 6 million steps, and the `dp` check skips most comparisons.
- **Space: O(n)** for the table.

## Edge cases and traps

- **Forgetting `dp[0] = true`.** Then nothing is ever true and you always return false.
- **Greedy matching.** Taking the longest word at each point fails: `"cars"` with `["car", "ca", "rs"]` only splits as `ca | rs`; greedy `car` leaves `s`.
- **Words used more than once.** `"aaaaaaa"` with `["aaaa", "aaa"]` is `aaa | aaaa`. Reuse is allowed.
- **Plain recursion without a memo.** Correct, but times out on `"aaa…ab"`.
- **Off-by-one in the slice.** The word ending at `i` starts at `i − L` and covers `s[i − L : i]`.

## Say it in the interview

> "Let `dp[i]` be whether the first `i` characters can be split. The last word of a split is some `w`, so `dp[i]` is true if `dp[i − len(w)]` is true and `s` ends with `w` at position `i`. `dp[0]` is true for the empty prefix. I fill it left to right and return `dp[n]`. That's O(n times words times word length) time and O(n) space. It's the same shape as Coin Change, with words instead of coins."

## Follow-ups interviewers ask

- **"Return every possible split, not just yes or no."** That's Word Break II: backtracking over the words, with a memo from position to the list of splits of the rest. The output itself can be exponential.
- **"The dictionary is huge."** Put it in a trie and walk forward from each true position. You stop as soon as no word continues, instead of trying every word.
- **"Can you use a set instead of looping over words?"** Yes: for each `i`, try starts `j` from `i − k` to `i − 1`, which is O(n · k) set lookups of strings up to length `k`.
