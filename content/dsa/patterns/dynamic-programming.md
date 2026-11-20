---
module: dynamic-programming
title: Dynamic Programming
readTime: 11
summary: Dynamic programming is recursion that writes its answers down. Learn one 4-step recipe (state, recurrence, base cases, order) and every problem in this stage turns into filling in a table.
---

## Why this stage matters

Dynamic programming (DP) has a reputation for being the stage where people give up. That reputation comes from seeing finished solutions — a mysterious `dp[i][j] = min(...)` line — without seeing how anyone got there.

Here is the secret: **every DP solution comes out of the same four steps.** You don't need a flash of genius. You need to answer four questions in order, and the code writes itself.

The slow idea DP replaces is **recursion that solves the same small problem again and again**. Take *Climbing Stairs*: count the ways to climb `n` steps taking 1 or 2 at a time. The natural recursion is "ways to reach `n` = ways to reach `n − 1` + ways to reach `n − 2`". Written plainly, it is correct but it keeps re-solving the same steps. For `n = 5`, `ways(3)` is computed twice and `ways(2)` three times. For `n = 45` the plain recursion makes about 3.7 billion calls, to fill in just 46 distinct answers.

DP's fix: **solve each small problem once, write the answer down, and look it up next time.**

## The core idea

Imagine someone asks you to add `1 + 1 + 1 + 1 + 1 + 1 + 1 + 1`. You count: 8. Now they add one more `+ 1`. You don't recount from the start. You say "9", because you remembered the 8.

That's all DP is. Precisely, a problem is a DP problem when:

1. **The big answer is built from answers to smaller versions of the same question** (the ways to reach step 5 come from the ways to reach steps 4 and 3).
2. **Those smaller questions repeat**, so remembering them saves real work.

The "smaller version" is called a **subproblem**, and the thing that names one subproblem (here, the step number `i`) is called the **state**.

## The 4-step recipe

Use this for every problem in the stage. Write the answers down in words before you write any code.

1. **Define the state in words.** Finish the sentence "`dp[i]` means …". Be exact: "the number of ways to stand on step `i`". If you can't say it in plain words, you can't write the recurrence.
2. **Write the recurrence.** How does `dp[i]` come from smaller states? The trick that almost always works: **think about the last move.** The last move onto step `i` was a 1-step (from `i − 1`) or a 2-step (from `i − 2`). So `dp[i] = dp[i − 1] + dp[i − 2]`.
3. **Set the base cases.** Which states can you answer without the recurrence? `dp[0] = 1` (one way to stand on the ground: do nothing) and `dp[1] = 1`.
4. **Choose the order.** Start top-down with a memo (it follows your recurrence directly), then turn it into a bottom-up table, then shrink the table if each row only looks at the last one or two.

### Step 4 in action: Climbing Stairs, three ways

**Form 1 — top-down with a memo.** This is your recurrence, plus a dictionary that remembers answers. It's the easiest to write first, because you don't have to think about order.

```python
def climbStairs(n):
    memo = {0: 1, 1: 1}            # base cases

    def ways(i):
        if i not in memo:          # solve each step only once
            memo[i] = ways(i - 1) + ways(i - 2)
        return memo[i]

    return ways(n)
```

**Form 2 — bottom-up table.** Same recurrence, but you fill the answers from small to big, so every value you need is already there. No recursion, no stack overflow.

```python
def climbStairs(n):
    dp = [0] * (n + 1)
    dp[0], dp[1] = 1, 1            # base cases
    for i in range(2, n + 1):      # small to big: dp[i-1], dp[i-2] are ready
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

**Form 3 — space-optimised.** `dp[i]` only ever reads the two values before it, so keep just those two.

```python
def climbStairs(n):
    prev2, prev1 = 1, 1            # dp[i-2], dp[i-1]
    for i in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

All three are O(n) time. The memo and the table use O(n) space; the last one uses O(1). In an interview, say all three out loud in that order. It shows you understand *why* the final version works.

## The templates

### 1D: "the answer for a prefix"

`dp[i]` describes the first `i` elements (or step `i`, or amount `i`). You fill it left to right, and each cell looks back a few cells, or at every earlier cell.

```python
dp = [base] * (n + 1)
dp[0] = ...                        # the empty prefix
for i in range(1, n + 1):
    dp[i] = best_of(dp[earlier] combined with element i)
return dp[n]
```

*Climbing Stairs*, *House Robber*, *Coin Change*, *Word Break*, *Longest Increasing Subsequence*.

### 2D: "two prefixes" or "a grid cell"

`dp[i][j]` describes the first `i` characters of one string and the first `j` of another, or the cell at row `i`, column `j`. Row 0 and column 0 are the base cases (an empty string, the top edge). Each cell looks at its neighbours above, left and diagonally up-left.

```python
dp = [[0] * (n + 1) for _ in range(m + 1)]
# fill row 0 and column 0 with the base cases
for i in range(1, m + 1):
    for j in range(1, n + 1):
        dp[i][j] = combine(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
return dp[m][n]
```

*Unique Paths*, *Longest Common Subsequence*, *Edit Distance*. A variant fills by substring `s[i..j]` (*Longest Palindromic Substring*), where the order changes: row `i` needs row `i + 1`, so you fill from the bottom row up.

**Space optimisation for 2D:** if row `i` only reads row `i − 1`, keep two rows (or one, carefully) instead of the whole grid. O(m·n) space becomes O(n).

### Choosing between two options

Many recurrences are "do it or don't". In *House Robber*, either you rob house `i` (and add `dp[i − 2]`) or you skip it (and keep `dp[i − 1]`). Write both options as named variables, then take the `max` or `min`. It keeps the recurrence readable.

## How to recognise this pattern

Reach for DP when you see:

- "**how many ways** to …" (count)
- "**minimum** / **maximum** / **longest** / **fewest** …" (optimise)
- "**can you** reach / split / make …" (yes or no)
- choices at each step that affect later choices (rob this house, so you can't rob the next)
- a brute force that tries every combination and is **exponential**: 2ⁿ subsets, every split point
- **subsequence** (keep order, may skip) as opposed to **subarray** (contiguous) — subsequences are almost always DP

If a greedy rule ("always take the biggest coin") feels right, try to break it with a small example first. *Coin Change* is the classic case where greedy fails.

## The mistakes everyone makes

1. **Writing code before the state.** If you can't finish "`dp[i]` means …" in plain words, stop. Every other bug comes from a fuzzy state.
2. **Off-by-one between `dp` and the input.** With "first `i` characters", `dp` has `n + 1` slots and character `i` is `s[i − 1]`. Pick one convention and say it in a comment.
3. **Wrong base cases.** `dp[0]` is usually the empty case: 1 way, 0 coins, `True`, or 0 length. Get it wrong and every later cell is wrong.
4. **Filling in the wrong order.** A cell must be computed after every cell it reads. Check the recurrence: does `dp[i]` read `dp[i + 1]`? Then loop backwards.
5. **"Impossible" values that overflow.** Using `INT_MAX` as "can't be made" and then adding 1 overflows. Use `amount + 1` or another safe sentinel.
6. **Space-optimising too early.** Get the full table right first. Then shrink it.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Climbing Stairs | The whole recipe on the smallest problem: memo, table, two variables |
| House Robber | "Take it or skip it" — the two-option recurrence |
| House Robber II | Breaking a circle into two straight-line problems |
| Longest Palindromic Substring | DP over substrings, filled from the bottom row up |
| Coin Change | Unbounded choices, "impossible" sentinels, and why greedy fails |
| Longest Increasing Subsequence | `dp[i]` = best ending exactly at `i`, then a binary-search speed-up |
| Longest Common Subsequence | The 2D template on two strings |
| Word Break | "Can the prefix be split?" — a yes/no DP |
| Unique Paths | The 2D template on a grid, and the one-row optimisation |
| Edit Distance | Three choices per cell — the stage's boss |

Try each problem for its time box before opening the walkthrough. When you're stuck, write the four recipe answers on paper before taking a hint. Most of the time, the state is the part you were missing.
