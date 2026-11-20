---
id: lc-121
title: Best Time to Buy and Sell Stock
pattern: Track the best buy so far
timeBox: 15
summary: Given a stock's price on each day, find the biggest profit from buying on one day and selling on a later day, or 0 if no trade makes money.
hints:
  - "Imagine today is the day you sell. Which earlier day would you have wanted to buy on?"
  - "If you sell today, the best buy is simply the cheapest price on any day up to today. You don't need to look back through all those days every time."
  - "Walk the prices once. Keep the cheapest price seen so far. At each day, profit = today − cheapest so far. Keep the maximum, and update the cheapest when today is lower."
insight: If you sell today, the best you can do is to have bought at the cheapest price so far. Keep that one number as you walk forward. It's a window whose left edge (the buy day) jumps forward whenever a new low appears.
time: O(n)
space: O(1)
related: [lc-53, lc-3, lc-209]
---

## The problem in plain English

You get an array `prices`, where `prices[i]` is the price of one stock on day `i`. You may make **one** trade: buy on one day, then sell on a **later** day. Return the largest profit you can make. If every possible trade loses money, don't trade at all and return `0`.

Constraints that matter: up to 10⁵ days, with prices between 0 and 10⁴.

Example: `prices = [7, 1, 5, 3, 6, 4]` → `5`. Buy on day 1 at price 1 and sell on day 4 at price 6. You can't "buy at 1, sell at 7", because the 7 comes first.

## Start with brute force

Try every buy day `i` and every later sell day `j > i`, and keep the largest `prices[j] − prices[i]`, starting from 0.

That's about n²/2 pairs. For n = 10⁵ that's 5·10⁹ checks, which is far too slow. But notice what the inner loop is doing. For a fixed sell day it's searching for the cheapest earlier day, and it searches again from scratch for every sell day.

## Building the intuition

Flip the brute force around. Instead of "for each buy day, try every sell day", fix the **sell** day first.

Say you sell today. Which earlier day should you have bought on? Obviously **the cheapest day so far**, because nothing else matters. Your profit for selling today is `today − (cheapest price up to today)`.

And "the cheapest price so far" doesn't need a search. As you walk forward one day at a time, it can only change in one way: today's price is lower than it. So you carry a single variable, `best_buy`, and update it in O(1).

### Why this is a sliding window

Think of the trade as a window `[buy day, sell day]`. The right edge is today, and it moves forward one day at a time. The left edge is the buy day, `best_buy`.

When does the left edge move? Only when today's price is **below** `best_buy`. At that moment every future sale is better measured from today, because today is a cheaper buy than anything before it. So the left edge **jumps** straight to today and the window collapses to a single day. Otherwise the window just grows, and you score it.

That's the variable-window shape you'll use all through this stage. The right edge grows every step, and the left edge moves forward when keeping it no longer makes sense. Here, "makes sense" means the buy price is still the lowest. The jump is a shortcut: you never need to shrink one step at a time, because nothing between the old buy day and today was cheaper.

## The optimal approach

1. Set `best_buy = prices[0]` and `profit = 0`.
2. For each `price` in `prices`:
   - if `price < best_buy`, set `best_buy = price` (the window's left edge jumps to today);
   - otherwise update `profit = max(profit, price − best_buy)`.
3. Return `profit`.

**The subtle detail:** on a day when you update `best_buy`, you skip the profit check. That's safe, because selling on the day you buy gives 0 profit, and `profit` already starts at 0. Starting `profit` at 0 is also what handles the "never trade" case. On a falling market like `[7, 6, 4, 3, 1]`, every day is a new low, so `profit` stays 0.

{{code}}

## Dry run

`prices = [7, 1, 5, 3, 6, 4]`

| Day | price | Lower than `best_buy`? | `best_buy` after | Sell today for | `profit` |
|---|---|---|---|---|---|
| 0 | 7 | no (equal) | 7 | 7 − 7 = 0 | 0 |
| 1 | 1 | **yes**, the window jumps to day 1 | 1 | — | 0 |
| 2 | 5 | no | 1 | 5 − 1 = 4 | 4 |
| 3 | 3 | no | 1 | 3 − 1 = 2 | 4 |
| 4 | 6 | no | 1 | 6 − 1 = 5 | **5** |
| 5 | 4 | no | 1 | 4 − 1 = 3 | 5 |

The window is `[day 1, day 4]`, so the answer is 5.

## Complexity

- **Time: O(n).** One pass, with O(1) work per day.
- **Space: O(1).** Two numbers: `best_buy` and `profit`.

## Edge cases and traps

- **Using the global minimum and maximum.** `max(prices) − min(prices)` is wrong when the maximum comes before the minimum. For `[2, 4, 1]` the answer is 2, not 3. Order matters.
- **Negative answers.** Never return a loss. Starting `profit` at 0 means "don't trade".
- **One day.** `[5]` → `0`. You can't buy and sell on the same day for a profit.
- **Updating `best_buy` after computing profit on the same day.** That's still correct, because the profit would be 0 either way. Just don't use *tomorrow's* price as today's buy.

## Say it in the interview

> "If I sell on a given day, the best buy is the cheapest price before it. So I walk the array once and keep the lowest price seen so far. You can picture a window from the buy day to today: whenever today is cheaper, the left edge jumps to today, and otherwise I score today's sale against the best buy. I keep the best profit, starting at zero for the 'don't trade' case. One pass, O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"As many trades as you like?"** That's Best Time to Buy and Sell Stock II. Add every positive day-to-day difference, `max(0, prices[i] − prices[i − 1])`. Still O(n).
- **"Return the days, not just the profit?"** Store the index of `best_buy`. When `profit` improves, record that index and today's index.
- **"How is this related to Maximum Subarray?"** Turn prices into daily changes. The best trade is then the best-sum run of consecutive changes, which is *Maximum Subarray* (Kadane's algorithm) in the Heaps & Greedy stage.
