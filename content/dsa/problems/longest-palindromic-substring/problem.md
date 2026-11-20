---
id: lc-5
title: Longest Palindromic Substring
pattern: Interval DP on substrings
timeBox: 25
summary: Find the longest stretch of consecutive characters in a string that reads the same forwards and backwards.
hints:
  - "A palindrome with its first and last characters chopped off is still a palindrome. Can you use that to build long answers from short ones?"
  - "s[i..j] is a palindrome exactly when s[i] == s[j] and the inside, s[i+1..j−1], is a palindrome. Lengths 1 and 2 only need the ends to match."
  - "Store dp[i][j] = is s[i..j] a palindrome. Each cell needs the cell one row down and one column left, so fill rows from i = n − 1 up to 0, and j from i to n − 1. Track the longest true cell."
insight: A substring is a palindrome when its two ends match and its inside is a palindrome. Storing that yes/no answer for every (start, end) pair lets you check each substring in O(1) instead of O(n).
time: O(n²)
space: O(n²)
related: [lc-125, lc-1143, lc-312]
---

## The problem in plain English

You get a string `s`. A **substring** is a run of consecutive characters. A **palindrome** reads the same forwards and backwards, like `racecar` or `abba`. Return the **longest substring of `s` that is a palindrome**. If several have the same maximum length, any one of them is accepted.

`s` has 1 to 1000 characters: digits and English letters.

Example: `s = "babad"` → `"bab"` (or `"aba"`, which is just as long).

## Start with brute force

List every substring `s[i..j]`, check whether it's a palindrome by comparing characters from both ends, and keep the longest.

There are about n²/2 substrings, and each check costs up to O(n). That's O(n³): for `n = 1000`, on the order of 10⁸ character comparisons. Too slow, and wasteful too.

## Building the intuition

Look at what the brute force repeats. To check `"xabay"` it compares the outer `x` and `y`, then the inner `"aba"`. Earlier it already checked `"aba"` on its own. The checks overlap.

Here's the key fact. Chop the first and last characters off a palindrome and what's left is still a palindrome. Turn it around:

> `s[i..j]` is a palindrome **exactly when** `s[i] == s[j]` **and** `s[i+1..j−1]` is a palindrome.

So the answer for a long substring is built from the answer for a shorter one. If you store the shorter answers, each new check costs O(1). Walk through the recipe:

1. **State.** `dp[i][j]` means *"`s[i..j]`, both ends included, is a palindrome"* (true or false).
2. **Recurrence.** `dp[i][j] = (s[i] == s[j]) and dp[i + 1][j − 1]`.
3. **Base cases.** Length 1 (`i == j`): always true. Length 2 (`j == i + 1`): true when the two characters match. For both, the "inside" is empty, so only the ends matter. In code: `j − i < 2`.
4. **Order.** `dp[i][j]` reads `dp[i + 1][j − 1]`, the row **below**. So fill rows from the bottom (`i = n − 1`) to the top (`i = 0`). Within a row, `j` goes from `i` to `n − 1`.

The order is the part most people get wrong. If you fill row 0 first, `dp[1][…]` doesn't exist yet.

## The optimal approach

1. Make an `n × n` table of `false`. Set `start = 0`, `best = 1` (any single character is a palindrome).
2. For `i` from `n − 1` down to 0, and `j` from `i` to `n − 1`:
   - If `s[i] == s[j]` and (`j − i < 2` or `dp[i + 1][j − 1]`), set `dp[i][j] = true`.
   - If it's true and longer than `best`, record `start = i`, `best = j − i + 1`.
3. Return `s[start : start + best]`.

**The subtle detail: the `j − i < 2` guard.** For length 2, `dp[i + 1][j − 1]` would be `dp[i + 1][i]`, a cell where start > end. That cell means nothing. The guard short-circuits before reading it.

**Space optimisation.** The table costs O(n²) memory. You can avoid it by **expanding around each centre**: every palindrome has a middle (one character, or the gap between two), and you can grow outwards while the ends match. Same O(n²) time, O(1) space:

```python
def expand(l, r):
    while l >= 0 and r < len(s) and s[l] == s[r]:
        l, r = l - 1, r + 1
    return l + 1, r - l - 1          # start, length

for c in range(len(s)):
    for l, r in ((c, c), (c, c + 1)):  # odd and even centres
        ...                              # keep the longest
```

It's the same fact read the other way: a palindrome grows by one matching pair at a time. Interviewers are happy with either; the table is what this stage is teaching.

{{code}}

## Dry run

`s = "babad"`. The table after filling. Row `i` is the start, column `j` is the end; `·` cells (start after end) are never used.

| i \ j | 0 `b` | 1 `a` | 2 `b` | 3 `a` | 4 `d` |
|---|---|---|---|---|---|
| **0** `b` | T | F | **T** | F | F |
| **1** `a` | · | T | F | **T** | F |
| **2** `b` | · | · | T | F | F |
| **3** `a` | · | · | · | T | F |
| **4** `d` | · | · | · | · | T |

How the rows fill, bottom to top:

| Row i | Interesting cells | Why | best after the row |
|---|---|---|---|
| 4 | `dp[4][4]` = T | single char | 1, `"b"` (initial) |
| 3 | `dp[3][4]` = F | `a ≠ d` | 1 |
| 2 | `dp[2][3]`, `dp[2][4]` = F | ends differ | 1 |
| 1 | `dp[1][3]` = T | `a == a` and `dp[2][2]` = T | **3, `"aba"`** (start 1) |
| 0 | `dp[0][2]` = T | `b == b` and `dp[1][1]` = T | 3 (same length, not replaced) |

Return `s[1:4] = "aba"`. `"bab"` would be equally correct.

## Complexity

- **Time: O(n²).** About n²/2 cells, each filled in O(1).
- **Space: O(n²)** for the table. Expand-around-centre gets it to **O(1)**.

## Edge cases and traps

- **Even-length palindromes.** `"cbbd"` → `"bb"`. Forgetting the length-2 base case (or, in expand-around-centre, the gap centres) misses them.
- **Single character.** `best = 1` and `start = 0` from the start, so `"a"` returns `"a"`.
- **No repeated characters.** `"ac"` → any single character.
- **Wrong fill order.** Filling `i` from 0 upwards reads rows that are still all false, and you only ever find lengths 1 and 2.
- **Confusing substring with subsequence.** A subsequence can skip characters. This problem wants consecutive characters. (Longest Palindromic *Subsequence* is a different DP.)

## Say it in the interview

> "A substring `s[i..j]` is a palindrome when its ends match and its inside `s[i+1..j−1]` is a palindrome. So I keep `dp[i][j]`, true if `s[i..j]` is a palindrome. Lengths 1 and 2 only need the ends to match. Each cell reads the row below, so I fill `i` from the bottom up and track the longest true cell. That's O(n²) time and space. I can drop the space to O(1) by expanding around each of the 2n − 1 centres instead."

## Follow-ups interviewers ask

- **"Can you use O(1) space?"** Expand around every centre, as shown above.
- **"Can you beat O(n²)?"** Manacher's algorithm finds it in O(n) by reusing mirror information. It's rarely expected in an interview; knowing the name and the idea is enough.
- **"Count all palindromic substrings instead?"** Same table: count the true cells. Or count successful expansions from every centre.
