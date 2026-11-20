---
id: cf-706b
title: Interesting Drink
pattern: Sort once, then upper bound per query
timeBox: 20
summary: Given the prices at n shops and q daily budgets, print for each day how many shops sell the drink at a price within that day's budget.
hints:
  - "Answering each day by scanning every shop is n·q steps, up to 10¹⁰. You need each answer in far less than n steps. What could you do to the prices once, up front?"
  - "Sort the prices. Now the shops you can afford on a day form a prefix of the sorted list: everything up to some point is affordable, everything after is not."
  - "For budget m, the answer is the first index whose price is > m (the upper bound). Binary search for it with lo = 0 and hi = n. That index is exactly the count of affordable shops."
insight: After sorting, "price > m" is false for a prefix and true for the rest. The first true index is the upper bound of m, and it equals the number of shops with price ≤ m. Sort once, then each day is one O(log n) search.
time: O((n + q) log n)
space: O(n)
related: [lc-34, lc-704, lc-875]
---

## The problem in plain English

This is a **Codeforces** problem, so you read input and print output yourself (no function to fill in).

Vasiliy wants to buy a drink. There are `n` shops, and shop `i` sells it for `x[i]` coins. He plans to buy for `q` days, and on day `j` he has `m[j]` coins. For each day, print **how many shops** sell the drink at a price he can afford, meaning `x[i] <= m[j]`.

Input: `n`, then the `n` prices, then `q`, then `q` budgets, one per line. Limits: `n` and `q` up to 10⁵, prices up to 10⁵, budgets up to 10⁹.

Example: prices `3 10 8 6 11` and budgets `1, 10, 3, 11`. With 1 coin he can afford nothing: `0`. With 10 coins he can afford 3, 10, 8 and 6: `4`. With 3 coins only the shop at 3: `1`. With 11 coins, all five: `5`.

## Start with brute force

For each day, loop over all shops and count prices `<= m`. It's clearly correct.

It costs `n` steps per day, so `n · q` in total. With `n = q = 10⁵` that's 10¹⁰ comparisons, far beyond the roughly 10⁸ simple steps per second you can count on. It times out.

## Building the intuition

The brute force redoes the same work every day: it looks at all the prices again, in a random order. What could you prepare **once**, so each day is quick?

Sort the prices: `3 6 8 10 11`. Now look at a budget of 10:

| i | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| sorted price | 3 | 6 | 8 | 10 | 11 |
| affordable with 10? | ✓ | ✓ | ✓ | ✓ | ✗ |

The affordable shops are always a **prefix** of the sorted list. Once one price is too expensive, every price after it is too. So you don't need to count them one by one. You only need to find where the prefix ends.

Turn that into the yes/no question from the primer: **"is `price[i] > m`?"** It's `F F F F T`, falses then trues. The first true index is where the prefix ends, and since indices start at 0, that index *is* the number of affordable shops. In the primer's words, it's the **upper bound** of `m`.

## The optimal approach

1. Read the `n` prices and sort them.
2. For each budget `m`:
   - Set `lo = 0` and `hi = n`. Index `n` is past the end; landing there means "every shop is affordable".
   - While `lo < hi`: `mid = lo + (hi - lo) // 2`. If `price[mid] > m`, set `hi = mid`. Otherwise set `lo = mid + 1`.
   - Print `lo`.
3. Collect the answers and print them all at the end. Printing 10⁵ lines one by one is slow in Python and Java.

**The subtle detail: `>` and not `>=`.** A shop whose price equals the budget is affordable. With `>=` you'd find the first price `>= m`, which stops *before* the shops priced exactly `m`. On the example, budget 10 would give 3 instead of 4. That is the lower bound versus upper bound difference, and it's one character.

{{code}}

## Dry run

Sorted prices `[3, 6, 8, 10, 11]`, so `n = 5`. Budget `m = 10`, question "is `price[mid] > 10`?":

| lo | mid | hi | price[mid] | > 10? | update |
|---|---|---|---|---|---|
| 0 | 2 | 5 | 8 | No | `lo = 3` |
| 3 | 4 | 5 | 11 | Yes | `hi = 4` |
| 3 | 3 | 4 | 10 | No | `lo = 4` |
| 4 | | 4 | | | stop |

Print `4`. Notice row 3: the price equals the budget, the answer is "No", and `lo` moves past it, so that shop is counted.

Budget `m = 1`:

| lo | mid | hi | price[mid] | > 1? | update |
|---|---|---|---|---|---|
| 0 | 2 | 5 | 8 | Yes | `hi = 2` |
| 0 | 1 | 2 | 6 | Yes | `hi = 1` |
| 0 | 0 | 1 | 3 | Yes | `hi = 0` |
| 0 | | 0 | | | stop |

Print `0`.

## Complexity

- **Time: O((n + q) log n).** Sorting costs O(n log n). Each of the `q` searches costs O(log n), about 17 steps for 10⁵ shops. In total that's a few million steps instead of 10¹⁰.
- **Space: O(n)** for the prices (plus the output buffer).

## Edge cases and traps

- **`>=` instead of `>`.** Undercounts every shop priced exactly at the budget. Test a budget equal to a price.
- **Budget bigger than every price.** The search ends at `lo = n`. That's the correct answer, all shops, and there's no array read at `n` because `mid` is always less than `hi`.
- **Duplicate prices.** Fine: the upper bound skips past every copy of a price `<= m`.
- **Slow I/O.** Up to 2 × 10⁵ numbers in and 10⁵ lines out. Read everything at once, and build the output in one string.
- **Java's `Arrays.sort(int[])`.** It's a quicksort, and some Codeforces tests are built to make it run in O(n²). Shuffle the array first, as the Java solution does.

## Say it in the interview

> "Scanning every shop for every day is n times q, up to ten to the ten. Instead I sort the prices once. Then the shops I can afford on a given day are a prefix of the sorted list, so I just need where that prefix ends. That's the first index whose price is strictly greater than the budget, the upper bound, and it equals the count. Each query is a binary search, so the total is O of n plus q, times log n."

## Follow-ups interviewers ask

- **"Prices are at most 10⁵. Can you avoid binary search?"** Yes. Count how many shops have each price, then build prefix sums so `atMost[v]` is the number of shops priced `<= v`. Each day is `atMost[min(m, 10⁵)]`, O(1). It only works because prices are small.
- **"What if shops can be added between days?"** A sorted array costs O(n) per insert. Use a balanced tree with order statistics, or a Fenwick tree over prices.
- **"What if you needed shops with price strictly less than m?"** Use the lower bound (`price[mid] >= m`) instead.
