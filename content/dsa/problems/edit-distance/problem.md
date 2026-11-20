---
id: lc-72
title: Edit Distance
pattern: 2D DP with three choices
timeBox: 25
summary: Find the fewest single-character inserts, deletes and replacements that turn one word into another.
hints:
  - "Look at the last character of each word. If they're equal, do you need to touch them at all?"
  - "If they differ, the last edit fixes word2's last character in one of three ways: replace word1's last character with it, delete word1's last character, or insert it at the end. Each leaves a smaller version of the same problem."
  - "Let dp[i][j] be the fewest edits turning the first i chars of word1 into the first j chars of word2. dp[i][0] = i, dp[0][j] = j. On a match, dp[i][j] = dp[i−1][j−1]; otherwise 1 + min(dp[i−1][j−1], dp[i−1][j], dp[i][j−1])."
insight: Compare the last characters. Equal means free, so drop both. Different means one edit (replace, delete or insert), and each edit leaves a smaller pair of prefixes. A table over all prefix pairs answers each pair once.
time: O(m · n)
space: O(m · n)
related: [lc-1143, lc-115, lc-62]
---

## The problem in plain English

You get two strings, `word1` and `word2`. One **edit** is one of:

- **insert** a character anywhere,
- **delete** a character,
- **replace** a character with a different one.

Return the **fewest edits** that turn `word1` into `word2`. This number is also called the Levenshtein distance.

Each word has 0 to 500 lowercase letters (empty strings are allowed). Below, `m = len(word1)` and `n = len(word2)`.

Example: `word1 = "horse"`, `word2 = "ros"` → `3`. Replace `h` with `r` (`rorse`), delete the second `r` (`rose`), delete `e` (`ros`).

## Start with brute force

At every point, try all three edits and recurse, keeping the cheapest way to finish.

Each step branches three ways and there can be up to `m + n` steps, so it's about 3ᵐ⁺ⁿ. For two 500-letter words that's 3¹⁰⁰⁰. It never finishes.

## Building the intuition

This is the boss of the stage, but it is built exactly like *Longest Common Subsequence*: **look only at the last characters.** Say you're turning `word1[0..i)` into `word2[0..j)`.

**The last characters are equal.** They already line up, so leave them alone. The cost is whatever it takes to turn the first `i − 1` characters into the first `j − 1`.

**They're different.** Then some edit has to produce `word2`'s last character. There are only three ways:

- **Replace** `word1`'s last character with it. Both last characters are now settled: cost `1 +` (first `i − 1` → first `j − 1`).
- **Delete** `word1`'s last character, and still build all `j` characters from the first `i − 1`: cost `1 +` (first `i − 1` → first `j`).
- **Insert** `word2`'s last character at the end. Now it's settled, and you still need the first `j − 1` from all `i`: cost `1 +` (first `i` → first `j − 1`).

Every option asks the same question on shorter prefixes. Walk through the recipe:

1. **State.** `dp[i][j]` means *the fewest edits to turn the first `i` characters of `word1` into the first `j` characters of `word2`*.
2. **Recurrence.**
   - If `word1[i − 1] == word2[j − 1]`: `dp[i][j] = dp[i − 1][j − 1]`.
   - Else: `dp[i][j] = 1 + min(dp[i − 1][j − 1], dp[i − 1][j], dp[i][j − 1])`, for replace, delete and insert.
3. **Base cases.** `dp[i][0] = i`: to reach the empty string, delete all `i` characters. `dp[0][j] = j`: from the empty string, insert all `j`.
4. **Order.** Like LCS, each cell reads up, left and up-left, so fill row by row, left to right.

A handy picture: in the table, **diagonal = replace (or free match), down = delete, right = insert.**

## The optimal approach

1. Make an `(m + 1) × (n + 1)` table. Fill column 0 with `0, 1, …, m` and row 0 with `0, 1, …, n`.
2. For `i` from 1 to `m`, for `j` from 1 to `n`, apply the recurrence.
3. Return `dp[m][n]`.

**The subtle detail: a match costs nothing.** It's tempting to write `1 + min(...)` for every cell. On a match that charges an edit you never made, and the answer comes out too big. Why is it safe to copy `dp[i − 1][j − 1]` without even looking at the other two options? Deleting or inserting a character can only change the distance by 1, so `dp[i − 1][j]` and `dp[i][j − 1]` are each at least `dp[i − 1][j − 1] − 1`. Add the 1 for the edit and they can never beat the free match.

**Space optimisation.** Row `i` only reads row `i − 1` and the cell just to its left. Keep two rows of length `n + 1` (or one row plus a saved "diagonal" variable) for O(n) space.

{{code}}

## Dry run

`word1 = "horse"` (rows), `word2 = "ros"` (columns). Bold cells are matches (copied from the diagonal).

| | "" | r | o | s |
|---|---|---|---|---|
| **""** | 0 | 1 | 2 | 3 |
| **h** | 1 | 1 | 2 | 3 |
| **o** | 2 | 2 | **1** | 2 |
| **r** | 3 | **2** | 2 | 2 |
| **s** | 4 | 3 | 3 | **2** |
| **e** | 5 | 4 | 4 | **3** |

A few cells worked out (replace = up-left, delete = up, insert = left):

| Cell | Characters | Rule | Value |
|---|---|---|---|
| `dp[1][1]` | `h` vs `r` | `1 + min(0, 1, 1)` | 1 |
| `dp[2][2]` | `o` vs `o` | match: `dp[1][1]` | 1 |
| `dp[2][3]` | `o` vs `s` | `1 + min(2, 3, 1)`, insert wins | 2 |
| `dp[3][1]` | `r` vs `r` | match: `dp[2][0]` | 2 |
| `dp[4][3]` | `s` vs `s` | match: `dp[3][2]` | 2 |
| `dp[5][3]` | `e` vs `s` | `1 + min(3, 2, 4)`, delete wins | **3** |

The answer is `dp[5][3] = 3`. Walking back: delete `e` (up from `dp[5][3]`), match `s`, delete `r` (up from `dp[3][2]` to `dp[2][2]`), match `o`, replace `h` with `r` (diagonal from `dp[1][1]`).

## Complexity

- **Time: O(m · n).** One O(1) step per cell: at most about 250,000 for two 500-letter words.
- **Space: O(m · n)** for the table, or **O(n)** with two rows.

## Edge cases and traps

- **Empty strings.** `"" → "abc"` is 3 inserts; `"abc" → ""` is 3 deletes; `"" → ""` is 0. The base row and column handle all three, as long as the table has the extra row and column.
- **Forgetting the base cases.** Leaving row 0 and column 0 at 0 says "free to delete everything", and the answer comes out too small.
- **Mixing up delete and insert.** With rows for `word1`, moving **down** consumes a `word1` character (delete) and moving **right** produces a `word2` character (insert). The min is the same either way, but the walk-back explanation will be wrong.
- **Greedy alignment.** Matching characters as early as possible fails. Only the table considers every alignment.

## Say it in the interview

> "Let `dp[i][j]` be the fewest edits turning the first `i` characters of `word1` into the first `j` of `word2`. If the last characters match, it's `dp[i − 1][j − 1]` for free. Otherwise I pay one edit: replace uses the diagonal, delete uses the cell above, insert uses the cell to the left, and I take the min. The first row and column are 0 to n and 0 to m, for inserting or deleting everything. That's O(m·n) time, and O(n) space if I keep only two rows."

## Follow-ups interviewers ask

- **"Only inserts and deletes are allowed."** Then the answer is `m + n − 2 · LCS(word1, word2)`, straight from *Longest Common Subsequence*.
- **"Are they one edit apart?"** That's One Edit Distance: a single two-pointer pass in O(m + n), no table needed.
- **"Different costs per operation?"** Replace the `1 +` with each operation's own cost. The structure doesn't change.
