---
id: lc-1143
title: Longest Common Subsequence
pattern: 2D DP on two prefixes
timeBox: 25
summary: Find the length of the longest sequence of characters that appears, in order but not necessarily side by side, in both of two strings.
hints:
  - "Compare the last characters of the two strings. What happens if they match? What if they don't?"
  - "If they match, that character can end the common subsequence: 1 + the answer for both strings without it. If they don't, at least one of them is not used, so drop one or the other and take the better result."
  - "Let dp[i][j] be the answer for the first i characters of text1 and the first j of text2. Row 0 and column 0 are 0. Fill row by row: diagonal + 1 on a match, else max(up, left)."
insight: Look at the last characters. If they match, use them both and add one to the answer for the shorter prefixes. If not, one of them is useless, so the answer is the better of dropping either. A table over all prefix pairs stores every answer once.
time: O(m · n)
space: O(m · n)
related: [lc-72, lc-300, lc-115]
---

## The problem in plain English

You get two strings, `text1` and `text2`. A **subsequence** keeps some characters in their original order and may skip others: `"ace"` is a subsequence of `"abcde"`, `"aec"` is not. A **common subsequence** is one that is a subsequence of both strings. Return the **length** of the longest one, or 0 if they share no characters.

Each string has 1 to 1000 lowercase letters. Below, `m` and `n` are their lengths.

Example: `text1 = "abcde"`, `text2 = "ace"` → `3` (the subsequence `"ace"`).

## Start with brute force

List every subsequence of `text1` (2ᵐ of them), check whether each is a subsequence of `text2` in O(n), keep the longest. For `m = 1000` that's 2¹⁰⁰⁰ subsequences. Impossible.

## Building the intuition

Don't think about the whole strings. Look at just **the last character of each**. Say `text1 = "abcde"` and `text2 = "ace"`.

- **They match** (`e` and `e`). Then use that `e` as the last character of the common subsequence. What's left is the same question on `"abcd"` and `"ac"`, plus one.
- **They don't match** (say `"abcd"` and `"ace"`: `d` vs `e`). They can't both be the last character of the common subsequence. So at least one of them is useless. Either drop `d` (solve `"abc"` vs `"ace"`) or drop `e` (solve `"abcd"` vs `"ac"`), and take the better.

Each case asks the same question on **shorter prefixes** of the two strings. A prefix is named by its length, so a pair of prefixes is named by two numbers. That's a 2D state. Walk through the recipe:

1. **State.** `dp[i][j]` means *the LCS length of the first `i` characters of `text1` and the first `j` characters of `text2`*.
2. **Recurrence.** The last characters are `text1[i − 1]` and `text2[j − 1]`.
   - Match: `dp[i][j] = dp[i − 1][j − 1] + 1`.
   - No match: `dp[i][j] = max(dp[i − 1][j], dp[i][j − 1])`.
3. **Base cases.** `dp[0][j] = dp[i][0] = 0`. An empty prefix shares nothing.
4. **Order.** Each cell reads the cell above, the cell to the left, and the cell up-left. Filling row by row, left to right, has all three ready.

Why is it safe to always use matching last characters? If the best common subsequence didn't use them, you could swap its last character for this pair and lose nothing. So taking the match is never worse.

## The optimal approach

1. Make an `(m + 1) × (n + 1)` table of zeros. Row 0 and column 0 stay 0.
2. For `i` from 1 to `m`, for `j` from 1 to `n`:
   - If `text1[i − 1] == text2[j − 1]`: `dp[i][j] = dp[i − 1][j − 1] + 1`.
   - Else: `dp[i][j] = max(dp[i − 1][j], dp[i][j − 1])`.
3. Return `dp[m][n]`.

**The subtle detail: the extra row and column.** `dp` has size `(m + 1) × (n + 1)`, so `dp[i][j]` is about characters `i − 1` and `j − 1`. The extra row and column hold the empty-prefix base cases, and they mean the loops never need an `if i == 0` check.

**Space optimisation.** Row `i` only reads row `i − 1`. Keep two rows (`prev` and `cur`) of length `n + 1` and swap them after each row. Space drops to O(min(m, n)) if you put the shorter string along the columns.

{{code}}

## Dry run

`text1 = "abcde"` (rows), `text2 = "ace"` (columns). Bold cells are matches (diagonal + 1); the rest are `max(up, left)`.

| | "" | a | c | e |
|---|---|---|---|---|
| **""** | 0 | 0 | 0 | 0 |
| **a** | 0 | **1** | 1 | 1 |
| **b** | 0 | 1 | 1 | 1 |
| **c** | 0 | 1 | **2** | 2 |
| **d** | 0 | 1 | 2 | 2 |
| **e** | 0 | 1 | 2 | **3** |

A few cells worked out:

| Cell | Characters | Rule | Value |
|---|---|---|---|
| `dp[1][1]` | `a` vs `a` | match: `dp[0][0] + 1` | 1 |
| `dp[2][2]` | `b` vs `c` | `max(dp[1][2], dp[2][1]) = max(1, 1)` | 1 |
| `dp[3][2]` | `c` vs `c` | match: `dp[2][1] + 1` | 2 |
| `dp[4][3]` | `d` vs `e` | `max(dp[3][3], dp[4][2]) = max(2, 2)` | 2 |
| `dp[5][3]` | `e` vs `e` | match: `dp[4][2] + 1` | **3** |

The answer is `dp[5][3] = 3`. Following the bold cells back gives `a`, `c`, `e`.

## Complexity

- **Time: O(m · n).** One O(1) step per cell. For two 1000-character strings, a million cells.
- **Space: O(m · n)** for the table, or **O(min(m, n))** with two rows.

## Edge cases and traps

- **No common characters.** `"abc"` vs `"def"` → 0. The table stays all zeros.
- **Identical strings.** The answer is the full length; every diagonal cell matches.
- **Index shift.** `dp[i][j]` compares `text1[i − 1]` and `text2[j − 1]`. Comparing `text1[i]` reads one past the end.
- **Taking `dp[i − 1][j − 1]` in the no-match case.** It's never larger than `max(up, left)`, so it isn't wrong, just pointless. Forgetting `up` or `left` *is* wrong.
- **Mixing it up with longest common substring.** A substring must be contiguous. That version resets to 0 on a mismatch and tracks the max cell.

## Say it in the interview

> "Let `dp[i][j]` be the LCS of the first `i` characters of `text1` and the first `j` of `text2`. If the last characters match, I use them: `dp[i − 1][j − 1] + 1`. If not, one of them isn't in the answer, so I take the max of dropping either one. Row 0 and column 0 are zero. I fill row by row in O(m·n) time. Since each row only needs the previous one, I can keep two rows for O(min(m, n)) space."

## Follow-ups interviewers ask

- **"Print the subsequence, not just its length."** Start at `dp[m][n]`. On a match, record the character and move diagonally; otherwise move toward the larger of up and left.
- **"Minimum deletions to make the two strings equal?"** `m + n − 2 · LCS`. Every character outside the LCS is deleted.
- **"How does this relate to Edit Distance?"** Same table shape, same "look at the last characters" idea, but three operations instead of two choices. That's *Edit Distance*, later in this stage.
