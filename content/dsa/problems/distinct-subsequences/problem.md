---
id: lc-115
title: Distinct Subsequences
pattern: 2D string DP, rolled to 1D
timeBox: 40
summary: Count how many different ways you can delete characters from s so that what's left is exactly t.
hints:
  - "Look at the last character of s. Either you use it as the last character of t, or you don't use it at all. Those two cases never overlap."
  - "Let dp[i][j] = the number of ways to form t[:j] from s[:i]. Skipping s[i−1] gives dp[i−1][j]. If s[i−1] == t[j−1], using it adds dp[i−1][j−1]."
  - "Base cases: dp[i][0] = 1 (the empty t can be formed one way: delete everything), dp[0][j] = 0 for j > 0. Each row only reads the previous row, so a 1-D array works if you loop j from right to left."
insight: "For each character of s, either it is used as the next character of t or it isn't. So ways(i, j) = ways(i−1, j) + (match ? ways(i−1, j−1) : 0). That's a 2-D DP like Longest Common Subsequence, but it counts instead of maximising."
time: O(m·n)
space: O(n)
related: [lc-1143, lc-72, lc-139]
---

## The problem in plain English

You get two strings, `s` and `t`. Count the number of **distinct subsequences** of `s` that equal `t`. A subsequence is what's left after deleting zero or more characters, keeping the order. "Distinct" means different sets of **positions**: two choices of positions count separately even if they spell the same word.

Lengths are up to 1000. The answer is guaranteed to fit in a 32-bit signed integer.

Example: `s = "rabbbit"`, `t = "rabbit"` → `3`. `s` has three `b`s, and you keep any two of them:

```text
ra b b _ it
ra b _ b it
ra _ b b it
```

## Start with brute force

Try every way to choose `len(t)` positions from `s` and check whether they spell `t`. That's `C(m, n)` choices. For `m = 1000` and `n = 500`, it's about 10²⁹⁹. Even a smarter recursion, "match or skip each character of s", is O(2ᵐ) without caching.

## Building the intuition

This Hard is two Medium ideas stacked together: the **two-string DP table** from *Longest Common Subsequence* and the **counting recurrence** from *Climbing Stairs* and *Unique Paths*, where you add the ways instead of taking a max.

**Step 1: make one decision.** Look at the last character of `s`. You either

- **use it** as the last character of `t`, which is only possible if they're equal. Then you still need to form the rest of `t` from the rest of `s`; or
- **skip it**: form all of `t` from the rest of `s`.

These two cases never overlap: in one the last position is chosen, in the other it isn't. So the total is the **sum** of the two. No double counting.

**Step 2: name the state.** The "rest of" pieces are prefixes, so let

```text
dp[i][j] = number of ways to form t[:j] (the first j chars of t) from s[:i]
```

Then:

```text
dp[i][j] = dp[i−1][j]                      (skip s[i−1])
         + dp[i−1][j−1]  if s[i−1] == t[j−1]   (use s[i−1] as t[j−1])
```

**Step 3: base cases.** `dp[i][0] = 1` for every `i`: there's exactly one way to form the empty string, which is to delete everything. And `dp[0][j] = 0` for `j > 0`: an empty `s` can't form a non-empty `t`.

Check it with `s = "aa"`, `t = "a"`: `dp[1][1] = dp[0][1] + dp[0][0] = 0 + 1 = 1`, and `dp[2][1] = dp[1][1] + dp[1][0] = 1 + 1 = 2`. Two ways: the first `a` or the second. Correct.

**Step 4: shrink to one row.** Row `i` only reads row `i − 1`. Keep one array `dp[0..n]`. For each character of `s`, update `dp[j] += dp[j−1]` where `t[j−1]` matches. But go from **right to left**, so that `dp[j−1]` is still the *old* row's value when you read it. It's the same trick as 0/1 knapsack: each character of `s` may be used at most once per match.

## The optimal approach

1. `dp = [1, 0, 0, …, 0]` (length `n + 1`).
2. For each character `c` in `s`:
   - for `j` from `n` down to `1`: if `t[j−1] == c`, then `dp[j] += dp[j−1]`.
3. Return `dp[n]`.

**The subtle detail: overflow in cells you don't care about.** The answer fits in 32 bits, but some cells don't. With `s = "a" × 1000` and `t = "a" × 500 + "b"`, the answer is 0, yet `dp[250]` reaches `C(1000, 250)`, which is far more than 2⁶⁴. Why is the answer still safe? Every cell that feeds into `dp[n]` adds into it, so it's **at most the answer**. The huge cells never reach `dp[n]`. So the final value is right, as long as the language survives the huge cells:

- **Python:** big integers, no issue.
- **Java:** `long` overflow just wraps around. No crash, and the wrapped cells never reach the answer.
- **C++:** *signed* overflow is undefined behaviour, and LeetCode's sanitizer stops the program with a runtime error. Use `unsigned long long`, which wraps legally.
- **JavaScript:** huge cells lose precision or become `Infinity`. They never feed the answer, and the cells that do stay exact.

{{code}}

## Dry run

`s = "babgbag"`, `t = "bag"`. The array is `dp[0..3]`, meaning ways to form `""`, `"b"`, `"ba"` and `"bag"`.

| char of s | j = 3 (`g`) | j = 2 (`a`) | j = 1 (`b`) | dp after |
|---|---|---|---|---|
| start | | | | `[1, 0, 0, 0]` |
| b | — | — | `+= dp[0]` → 1 | `[1, 1, 0, 0]` |
| a | — | `+= dp[1]` → 1 | — | `[1, 1, 1, 0]` |
| b | — | — | `+= 1` → 2 | `[1, 2, 1, 0]` |
| g | `+= dp[2]` → 1 | — | — | `[1, 2, 1, 1]` |
| b | — | — | `+= 1` → 3 | `[1, 3, 1, 1]` |
| a | — | `+= dp[1]` → 1 + 3 = 4 | — | `[1, 3, 4, 1]` |
| g | `+= dp[2]` → 1 + 4 = 5 | — | — | `[1, 3, 4, 5]` |

The answer is `dp[3] = 5`. Look at the second `a`: it adds 3 to `"ba"`, because each of the three `b`s before it can pair with it.

## Complexity

- **Time: O(m·n).** For each of the `m` characters of `s`, we scan the `n` positions of `t`. That's 10⁶ steps at the limits.
- **Space: O(n)** for one row. The 2-D table would be O(m·n).

## Edge cases and traps

- **`t` longer than `s`.** The answer is 0, and the DP produces it naturally: `dp[n]` can never get filled.
- **Left-to-right inner loop.** If `j` goes upward, `dp[j−1]` is already the *new* value, and one character of `s` gets counted twice in the same match. With `s = "a"`, `t = "aa"` you'd get 1 instead of 0.
- **Wrong base case.** `dp[0]` must be 1, not 0. Otherwise nothing ever gets counted.
- **Signed overflow in C++.** `int` or `long long` can overflow in cells that don't matter, and that's still undefined behaviour. Use `unsigned long long`.
- **Confusing with LCS.** LCS takes a `max` over "skip from s or skip from t". Here you may only skip from `s`, because every character of `t` must be matched. And you **add**, because you're counting.

## Say it in the interview

> "For each character of s, I either use it as the next unmatched character of t, or I skip it. The two choices never overlap, so I add them. dp[i][j], the ways to form the first j characters of t from the first i of s, equals dp[i−1][j], plus dp[i−1][j−1] when the characters match. dp[i][0] is 1. Each row only needs the previous one, so I keep one array and loop j from right to left. That's O(m·n) time and O(n) space. Some unused cells can overflow, so in C++ I use unsigned arithmetic."

## Follow-ups interviewers ask

- **"Return the count modulo 10⁹ + 7 instead."** Same DP, taking `% MOD` after each addition. Then the overflow question disappears.
- **"Count distinct subsequences of s itself (all of them, not one target)."** (LeetCode 940.) A different recurrence: `dp[i] = 2·dp[i−1] − dp[last[c] − 1]`, where subtracting removes the repeats created by the previous occurrence of the same character.
- **"Is t a subsequence of s at all?"** That's just two pointers, O(m). This problem is the counting version of that question.
