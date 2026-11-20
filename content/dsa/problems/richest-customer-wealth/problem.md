---
id: lc-1672
title: Richest Customer Wealth
pattern: Sum each row, keep the best
timeBox: 15
summary: Each row of a grid is one customer's bank balances; return the largest total any single customer has.
hints:
  - "Forget the whole grid for a moment. How would you find the wealth of just one customer, one row?"
  - "Once you can total one row, you need the biggest of all the row totals. What do you need to remember as you go?"
  - "Loop over the rows. Add up each row with an inner loop, then compare that total with a running best and keep whichever is larger."
insight: A 2-D grid is just a list of rows. Total each row with an inner loop, and keep a running maximum across rows. You never need to store all the totals.
time: O(m · n)
space: O(1)
related: [lc-412, lc-121, lc-74]
---

## The problem in plain English

You get a grid `accounts` with `m` rows and `n` columns. Row `i` is customer `i`, and `accounts[i][j]` is how much money they keep in bank `j`. A customer's **wealth** is the sum of their row. Return the largest wealth.

Both `m` and `n` are between 1 and 50, and every amount is between 1 and 100.

Example: `accounts = [[1, 5], [7, 3], [3, 5]]` → `10`. The row totals are `6`, `10` and `8`, and the biggest is `10`.

## Building the intuition

A grid looks scary the first time, but it's only a **list of lists**. `accounts[1]` is the whole second row, `[7, 3]`, and `accounts[1][0]` is the first number in it, `7`.

So split the job in two:

1. **One row.** Adding up a list is a loop with a running total: start at 0, add each number.
2. **All rows.** Now you have one total per row, and you want the biggest. That's another running value: start `best` at 0 and replace it whenever a row beats it.

Put the first loop inside the second, and you're done. This "loop inside a loop" shape is how you visit every cell of any grid.

Notice you don't need a list of all the totals. Each row only has to beat the best one seen so far.

## The optimal approach

1. Set `best = 0`.
2. For each `row` in `accounts`:
   - set `wealth = 0`, then add every amount in the row to it;
   - if `wealth > best`, set `best = wealth`.
3. Return `best`.

The subtle detail: reset `wealth` to 0 **inside** the outer loop. If you set it once before both loops, it keeps growing across rows and you return the grand total of the whole grid.

{{code}}

## Complexity

- **Time: O(m · n).** Every cell is added exactly once. At most 50 × 50 = 2,500 additions.
- **Space: O(1).** Just `best` and `wealth`, however big the grid is.

## Edge cases and traps

- **Forgetting to reset `wealth` for each row.** The most common bug here. Always ask: does this variable belong to one row, or to all rows?
- **Starting `best` at a value that could win.** 0 is safe here because every amount is at least 1. If negatives were allowed, start at the first row's total instead.
- **Mixing up rows and columns.** `accounts[i][j]` is customer `i`, bank `j`. Summing a column would give one bank's deposits, not one customer's wealth.
- **One customer, or one bank.** A 1 × 1 grid returns its only number. Your loops handle it without special code.

## Say it in the interview

> "Each row is one customer, so I total each row with an inner loop and keep a running maximum across rows. I reset the row total for every customer. Every cell is visited once, so it's O(m times n) time and O(1) extra space."

## Follow-ups interviewers ask

- **"Return which customer is richest, not how rich."** Keep the row index alongside `best` and update both together.
- **"What if amounts can be huge?"** 50 amounts of up to 10⁹ each would pass 2³¹, so use a 64-bit `long` for `wealth`.
