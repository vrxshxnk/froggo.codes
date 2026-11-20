---
id: lc-875
title: Koko Eating Bananas
pattern: Binary search on the answer
timeBox: 25
summary: Find the slowest whole-number eating speed that lets Koko finish every pile of bananas within h hours, when each hour she eats from only one pile.
hints:
  - "Forget finding the speed directly. If someone hands you a speed k, can you check quickly whether Koko finishes in time?"
  - "At speed k, a pile of p bananas takes ceil(p / k) hours. Add that up over all piles. And notice: if speed k is fast enough, then k + 1 is fast enough too."
  - "Possible speeds run from 1 to max(piles), and the question 'does speed k finish within h hours?' goes F F F T T T. Binary search for the first T, using a 64-bit total for the hours."
insight: Faster never hurts, so "speed k finishes within h hours" is false up to some speed and true from then on. Binary search that yes/no question over speeds 1 to max(piles); each check is one O(n) pass.
time: O(n log M), M = max(piles)
space: O(1)
related: [cf-706b, lc-34, lc-704]
---

## The problem in plain English

Koko has `n` piles of bananas; pile `i` has `piles[i]` bananas. She picks a fixed eating speed `k` (bananas per hour, a whole number). Each hour she chooses one pile and eats `k` bananas from it. If the pile has fewer than `k` left, she finishes it and **wastes the rest of that hour**. She never moves to a second pile in the same hour.

Return the **smallest** `k` that lets her finish every pile within `h` hours.

Limits: up to 10⁴ piles, each up to 10⁹ bananas, and `n <= h <= 10⁹`, so an answer always exists.

Example: `piles = [3, 6, 7, 11]`, `h = 8` → `4`. At speed 4 the piles take 1, 2, 2 and 3 hours: 8 in total. At speed 3 they take 1, 2, 3 and 4: 10 hours, too slow.

## Start with brute force

Try `k = 1, 2, 3, …` and return the first speed that finishes in time. To test one speed, add up the hours for every pile. It's correct, because the first speed that works is by definition the smallest.

But a single pile can hold 10⁹ bananas, and with `h` equal to `n` the answer is the size of the largest pile. That's up to 10⁹ speeds to try, each costing 10⁴ steps: 10¹³ steps. Hopeless.

## Building the intuition

The brute force has two parts: **checking** a speed (fast, one pass) and **choosing** which speeds to check (slow, all of them). Keep the check, fix the choosing.

Here's the key observation. If Koko finishes in time at speed 5, does she finish at speed 6? Of course: every pile takes the same time or less. So if you write down "does speed `k` work?" for every `k`, you get something like this for the example:

| k | 1 | 2 | 3 | **4** | 5 | 6 | … | 11 |
|---|---|---|---|---|---|---|---|---|
| hours needed | 27 | 15 | 10 | **8** | 8 | 6 | … | 4 |
| ≤ 8? | F | F | F | **T** | T | T | … | T |

Falses, then trues. That's exactly the shape binary search needs, even though there's no sorted array anywhere. You're searching over **answers**, not over indices. The smallest working speed is the first T.

What range? `lo = 1`, the slowest possible speed. `hi = max(piles)`: at that speed every pile takes exactly 1 hour, so it needs `n <= h` hours and **always works**. Starting `hi` on a known true is what the template's invariant requires.

## The optimal approach

1. `lo = 1`, `hi = max(piles)`.
2. While `lo < hi`:
   - `mid = lo + (hi - lo) // 2`.
   - Compute `hours = sum of ceil(p / mid)` over all piles.
   - If `hours <= h`, speed `mid` works, and so might something slower: `hi = mid`.
   - Otherwise `mid` is too slow, and so is everything below it: `lo = mid + 1`.
3. Return `lo`.

To compute `ceil(p / k)` with integers, use `(p + k - 1) // k`. Adding `k - 1` pushes any leftover bananas over into one more hour.

**The subtle detail: overflow, in two places.** At speed 1, the hours add up to the total number of bananas, up to 10⁴ × 10⁹ = 10¹³. That doesn't fit in a 32-bit `int` (max about 2.1 × 10⁹), so `hours` must be 64-bit. And `p + k - 1` can reach 2 × 10⁹, also past the `int` limit, so do that sum in 64-bit as well. Python doesn't care, but C++ and Java will silently wrap around and give a wrong answer.

{{code}}

## Dry run

`piles = [3, 6, 7, 11]`, `h = 8`, so `lo = 1`, `hi = 11`:

| lo | mid | hi | hours at speed mid | ≤ 8? | update |
|---|---|---|---|---|---|
| 1 | 6 | 11 | 1 + 1 + 2 + 2 = 6 | Yes | `hi = 6` |
| 1 | 3 | 6 | 1 + 2 + 3 + 4 = 10 | No | `lo = 4` |
| 4 | 5 | 6 | 1 + 2 + 2 + 3 = 8 | Yes | `hi = 5` |
| 4 | 4 | 5 | 1 + 2 + 2 + 3 = 8 | Yes | `hi = 4` |
| 4 | | 4 | | | stop |

Return `4`. Look at row 3: speed 5 works, but the loop doesn't stop. It keeps `5` as `hi` and checks whether something slower also works. Speed 4 does, so the answer is 4.

## Complexity

- **Time: O(n log M)**, where `M = max(piles)`. The search range has `M` speeds, so it takes about log₂ M steps (30 for 10⁹), and each step is one O(n) pass over the piles. That's about 3 × 10⁵ operations instead of 10¹³.
- **Space: O(1).** Just `lo`, `hi`, `mid` and the running total.

## Edge cases and traps

- **32-bit hours.** The total can hit 10¹³. In C++ use `long long`, in Java `long`.
- **`(p + k - 1)` overflowing.** With `p` and `k` near 10⁹, the sum passes 2³¹ − 1. Do it in 64-bit.
- **`p / k` instead of a ceiling.** A pile of 7 at speed 4 takes 2 hours, not 1. Plain division undercounts.
- **`lo = 0`.** Speed 0 divides by zero. The slowest real speed is 1.
- **`hi = sum(piles)` or `hi = h`.** These still work but are bigger than needed. `max(piles)` is the smallest speed that is *guaranteed* to work.
- **`h == n`.** She must clear one pile per hour, so the answer is `max(piles)`. The search finds it with no special case.

## Say it in the interview

> "Instead of finding the speed directly, I ask: given a speed k, does Koko finish within h hours? That's one pass, adding up the ceiling of each pile divided by k. Faster speeds never take longer, so the answers go false, false, then true from some point on. I binary search speeds from 1 to the largest pile, which always works, for the first true. That's O(n log M). I keep the hour total in 64 bits because it can reach ten to the thirteen."

## Follow-ups interviewers ask

- **"Where else does this pattern show up?"** Any "minimum capacity / time / size such that it's possible" problem with a cheap check: *Capacity To Ship Packages Within D Days*, *Split Array Largest Sum*, *Minimum Number of Days to Make m Bouquets*. Same template, different `ok`.
- **"Can you stop the hour count early?"** Yes. Break out of the loop as soon as `hours > h`. It doesn't change the big-O, but it also keeps the total small.
- **"What if she could switch piles within an hour?"** Then she just eats bananas at a steady rate, and the answer is `ceil(sum(piles) / h)`. No search needed.
