---
id: lc-322
title: Coin Change
pattern: Unbounded knapsack, minimise count
timeBox: 25
summary: Find the fewest coins that add up to an exact amount, using any number of each coin type, or report that it can't be done.
hints:
  - "Greedy (always take the biggest coin that fits) fails. Try coins [1, 3, 4] and amount 6."
  - "Think about the last coin you add. If it's coin c, the rest of the pile adds up to amount − c, and that rest should itself use as few coins as possible."
  - "Let dp[a] be the fewest coins that make exactly a. Then dp[a] = 1 + min(dp[a − c]) over every coin c ≤ a. Start with dp[0] = 0 and fill a from 1 up to amount; use amount + 1 to mean 'impossible'."
insight: The last coin in an optimal pile is some coin c, and the rest of the pile must be an optimal pile for amount − c. So dp[a] = 1 + min over coins of dp[a − c], filled from 0 upwards.
time: O(amount · k)
space: O(amount)
related: [lc-139, lc-70, lc-300]
---

## The problem in plain English

You get a list of coin values `coins` and a target `amount`. You have an **unlimited supply of every coin**. Return the **fewest coins** whose values add up to exactly `amount`. If no combination works, return `-1`. If `amount` is 0, the answer is 0 (no coins).

There are 1 to 12 coin types, each value is between 1 and 2³¹ − 1, and `amount` is at most 10⁴. Below, `k` is the number of coin types.

Example: `coins = [1, 2, 5]`, `amount = 11` → `3`, because `5 + 5 + 1 = 11`.

## Start with brute force

**Greedy first, because everyone tries it.** "Take the biggest coin that fits, repeat." With `coins = [1, 3, 4]` and `amount = 6`, greedy takes `4 + 1 + 1` (3 coins), but `3 + 3` uses only 2. Greedy is wrong.

**Real brute force:** try every coin as the next one, recursively, and keep the smallest count.

```python
def fewest(a):
    if a == 0: return 0
    return 1 + min(fewest(a - c) for c in coins if c <= a)   # (ignoring "impossible")
```

Each call branches `k` ways and the depth can reach `amount`, so it's exponential. With `amount = 10⁴` it never finishes.

## Building the intuition

Run the recursion in your head for `coins = [1, 3, 4]`, `amount = 6`. `fewest(6)` asks `fewest(5)`, `fewest(3)` and `fewest(2)`. Then `fewest(5)` asks `fewest(4)`, `fewest(2)`, `fewest(1)`. `fewest(2)` is already being asked twice. There are only 7 different questions here (`fewest(0)` to `fewest(6)`), asked many times each.

So store the answer for every amount from 0 up to `amount`. Walk through the recipe:

1. **State.** `dp[a]` means *the fewest coins that add up to exactly `a`*, or "impossible".
2. **Recurrence.** Think about the **last coin** in the pile. If it's coin `c`, the rest of the pile makes `a − c`, and it had better be the smallest such pile. You don't know which coin is last, so try them all: `dp[a] = 1 + min(dp[a − c])` over every coin `c ≤ a`.
3. **Base case.** `dp[0] = 0`. Zero coins make zero.
4. **Order.** `dp[a]` reads smaller amounts, so fill `a` from 1 upwards.

This shape is called the **unbounded knapsack**: you can reuse each item (coin) as many times as you like, which is why `dp[a − c]` may itself already contain coin `c`.

## The optimal approach

1. Let `INF = amount + 1`. No real answer can need that many coins (even using only 1s you'd need just `amount`).
2. Make `dp` of size `amount + 1`, all `INF`. Set `dp[0] = 0`.
3. For `a` from 1 to `amount`, for each coin `c`:
   - if `c ≤ a` and `dp[a − c] + 1 < dp[a]`, set `dp[a] = dp[a − c] + 1`.
4. Return `dp[amount]` if it isn't `INF`, else `-1`.

**The subtle detail: the "impossible" value.** If you use `INT_MAX` for impossible, then `dp[a − c] + 1` overflows to a negative number and wins every `min`. `amount + 1` is safe: it's bigger than any real answer, and adding 1 still fits. An impossible `dp[a − c]` gives `amount + 2`, which can never beat anything.

**Space.** The table is already one-dimensional and every cell may be read later, so there's no further space optimisation here.

{{code}}

## Dry run

`coins = [1, 3, 4]`, `amount = 6`, so `INF = 7`. Each row tries every coin as the last one.

| a | last coin 1: dp[a − 1] + 1 | last coin 3: dp[a − 3] + 1 | last coin 4: dp[a − 4] + 1 | dp[a] |
|---|---|---|---|---|
| 0 | — | — | — | 0 (base) |
| 1 | dp[0] + 1 = 1 | too big | too big | **1** |
| 2 | dp[1] + 1 = 2 | too big | too big | **2** |
| 3 | dp[2] + 1 = 3 | dp[0] + 1 = 1 | too big | **1** |
| 4 | dp[3] + 1 = 2 | dp[1] + 1 = 2 | dp[0] + 1 = 1 | **1** |
| 5 | dp[4] + 1 = 2 | dp[2] + 1 = 3 | dp[1] + 1 = 2 | **2** |
| 6 | dp[5] + 1 = 3 | dp[3] + 1 = **2** | dp[2] + 1 = 3 | **2** |

Final table: `dp = [0, 1, 2, 1, 1, 2, 2]`. The answer is 2: last coin 3, on top of `dp[3] = 1` (one more 3). Greedy's `4 + 1 + 1` shows up in the row for `a = 6` as the "last coin 4" option, worth 3, and loses.

## Complexity

- **Time: O(amount · k).** `amount` cells, and each tries all `k` coins. At most 10⁴ × 12 = 120,000 steps.
- **Space: O(amount)** for the table.

## Edge cases and traps

- **`amount = 0`.** Return 0, not -1. The loop doesn't run and `dp[0] = 0`.
- **Impossible amounts.** `coins = [2]`, `amount = 3` → -1. Make sure `INF` is converted back to -1.
- **Huge coin values.** A coin can be 2³¹ − 1. Check `c ≤ a` before computing `a − c`; never compute `a + c`.
- **Overflow from `INT_MAX + 1`.** Use `amount + 1` as the sentinel, as above.
- **Greedy.** Correct for some coin systems (like Indian rupee notes), wrong in general. Always test `[1, 3, 4]`, 6.

## Say it in the interview

> "Greedy fails, for example on coins 1, 3, 4 and amount 6. Let `dp[a]` be the fewest coins that make exactly `a`. The last coin is some `c`, and the rest must be optimal for `a − c`, so `dp[a] = 1 + min(dp[a − c])` over all coins that fit. `dp[0] = 0`, and I use `amount + 1` for impossible so nothing overflows. Filling `a` from 1 up costs O(amount times the number of coins) time and O(amount) space."

## Follow-ups interviewers ask

- **"Count the number of ways to make the amount instead?"** That's Coin Change II. Loop over **coins on the outside** and amounts inside, with `dp[a] += dp[a − c]` and `dp[0] = 1`, so each combination is counted once regardless of order.
- **"Why not BFS?"** You can: each amount is a node, each coin an edge, and the shortest path from 0 to `amount` is the answer. Same complexity; the DP is shorter to write.
- **"What if each coin can be used only once?"** That's the 0/1 knapsack. Loop `a` **downwards** for each coin so a coin isn't reused within its own pass.
