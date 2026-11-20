---
id: lc-887
title: Super Egg Drop
pattern: Flip the DP to moves → floors
timeBox: 40
summary: With k eggs and a building of n floors, find the fewest drops that guarantee you learn exactly which floor eggs start breaking at.
hints:
  - "Write the natural recurrence first. Drop from floor x: the egg breaks (k − 1 eggs, x − 1 floors below are left) or survives (k eggs, n − x floors above). You must survive the worse case."
  - "dp(k, n) = 1 + min over x of max(dp(k − 1, x − 1), dp(k, n − x)). The first term rises with x and the second falls, so the best x can be binary searched. That's O(k·n·log n). Can you avoid searching for x at all?"
  - "Turn the question around: with m moves and k eggs, how many floors can you fully handle? Call it f(m, k). One drop splits the building into 'below' (handled with m − 1 moves, k − 1 eggs) and 'above' (m − 1 moves, k eggs), plus the floor itself. So f(m, k) = f(m − 1, k − 1) + f(m − 1, k) + 1. Increase m until f(m, k) ≥ n."
insight: Instead of asking "how many moves for n floors?", ask "how many floors can m moves and k eggs handle?". One drop splits the building into a part below (one egg fewer) and a part above (same eggs), so floors(m, k) = floors(m−1, k−1) + floors(m−1, k) + 1. There's no min or max to search over.
time: O(k · m), where m is the answer (at most n)
space: O(k)
related: [lc-875, lc-704, lc-322]
---

## The problem in plain English

You have `k` identical eggs and a building with floors `1` to `n`. There's an unknown floor `f` (from `0` to `n`): an egg dropped from any floor **above** `f` breaks, and from floor `f` or below it survives. A surviving egg can be reused. A broken egg is gone.

Each drop is one **move**. Find the **minimum number of moves** that guarantees you know `f`, however unlucky you are. `k` is up to 100, and `n` up to 10⁴.

Examples:

- `k = 1`, `n = 2` → `2`. With one egg you can't risk skipping floors. Try floor 1, then floor 2.
- `k = 2`, `n = 6` → `3`.
- `k = 3`, `n = 14` → `4`.

## Start with brute force

The natural recursion: you have `k` eggs and `n` floors still in question. Try every first floor `x`:

- **breaks:** `f` is below `x`. You have `k − 1` eggs and `x − 1` floors left;
- **survives:** `f` is `x` or above. You have `k` eggs and `n − x` floors left.

You need a guarantee, so take the **worse** case. And you get to pick `x`, so take the **best** `x`:

```text
dp(k, n) = 1 + min over x in 1..n of  max(dp(k − 1, x − 1), dp(k, n − x))
dp(1, n) = n,   dp(k, 0) = 0
```

With memoisation, there are `k·n` states, each trying `n` floors: O(k·n²). For `k = 100` and `n = 10⁴`, that's 10¹⁰. Too slow.

## Building the intuition

This Hard stacks a **min–max DP** (like *Coin Change*, but against an adversary) on top of **binary search on a monotone function** (the Binary Search stage). Then it rewards you for rethinking the state.

**Step 1: speed up the inner loop with binary search.** Look at the two terms as `x` grows. `dp(k − 1, x − 1)` (breaks) **rises**: more floors below means more work. `dp(k, n − x)` (survives) **falls**. One rises and one falls, so their `max` is V-shaped, and the bottom of the V is where they cross. You can binary search for the crossing, just like *Koko Eating Bananas*. That's O(k·n·log n), about 1.4 × 10⁷. That passes, and it's a solid interview answer.

**Step 2: flip the question.** The hard part of the recurrence is the `min over x`. What if you asked the opposite question, one where you don't choose anything?

> **With `m` moves and `e` eggs, what's the largest number of floors I can fully handle?**

Call it `floors(m, e)`. Make your first drop from the best possible floor. Then:

- if it **breaks**, the answer is below. You have `m − 1` moves and `e − 1` eggs, which handle `floors(m − 1, e − 1)` floors. So put exactly that many floors below you;
- if it **survives**, the answer is above. You have `m − 1` moves and `e` eggs, which handle `floors(m − 1, e)` floors above you;
- plus the floor you dropped from.

```text
floors(m, e) = floors(m − 1, e − 1) + floors(m − 1, e) + 1
floors(0, e) = 0,   floors(m, 0) = 0
```

No min, no max, no search. You just add. Now increase `m` from 1 until `floors(m, k) ≥ n`. That `m` is the answer.

**Sanity check with one egg:** `floors(m, 1) = floors(m − 1, 0) + floors(m − 1, 1) + 1 = floors(m − 1, 1) + 1 = m`. One egg, `m` moves, `m` floors: you walk up one floor at a time. Correct.

**Why is this fast?** With plenty of eggs, `floors(m, e)` roughly doubles with each move (it reaches `2ᵐ − 1` when `e ≥ m`), so `m` stays around log n. With 1 egg, `m = n`. Either way, the work is `k` updates per move.

## The optimal approach

1. `covered = [0] * (k + 1)`. `covered[e]` is `floors(m, e)` for the current `m`. Start with `moves = 0`.
2. While `covered[k] < n`:
   - `moves += 1`;
   - for `e` from `k` down to `1`: `covered[e] = covered[e − 1] + covered[e] + 1`.
3. Return `moves`.

**The subtle detail: loop eggs from high to low.** The new `covered[e]` needs the *previous move's* `covered[e − 1]`. Going from high `e` to low, `covered[e − 1]` hasn't been updated yet this round, so it still holds the old value. It's the same right-to-left trick as 0/1 knapsack and *Distinct Subsequences*.

**Overflow?** We stop as soon as `covered[k] ≥ n`. Every value is at most about twice the previous round's, plus one, so nothing goes far past 2 × 10⁴. A plain `int` is fine.

{{code}}

## Dry run

`k = 2`, `n = 6`.

| moves | covered[2] = covered[1] + covered[2] + 1 | covered[1] = covered[0] + covered[1] + 1 | covered | ≥ 6? |
|---|---|---|---|---|
| 0 | — | — | `[0, 0, 0]` | no |
| 1 | 0 + 0 + 1 = 1 | 0 + 0 + 1 = 1 | `[0, 1, 1]` | no |
| 2 | 1 + 1 + 1 = 3 | 0 + 1 + 1 = 2 | `[0, 2, 3]` | no |
| 3 | 2 + 3 + 1 = 6 | 0 + 2 + 1 = 3 | `[0, 3, 6]` | **yes** → 3 |

The table also tells you the strategy. With 3 moves and 2 eggs, drop first from floor `covered[1] + 1 = 3` (using the old `covered[1] = 2`). If it breaks, one egg and 2 moves check floors 1 and 2. If it survives, 2 eggs and 2 moves handle the 3 floors above.

## Complexity

- **Time: O(k · m)**, where `m` is the answer. In the worst case (`k = 1`), `m = n`, so O(k·n) is a safe bound. With many eggs, `m` is about log₂ n, so it's nearly O(k log n).
- **Space: O(k)** for one row of the table.

## Edge cases and traps

- **`n = 1`.** One drop always settles it. The loop runs once.
- **`k = 1`.** The answer is `n`. The loop runs `n` times, which is at most 10⁴, so it's fine.
- **More eggs than useful.** With `k = 100` and `n = 10⁴`, the answer is 14 (2¹⁴ − 1 = 16383 ≥ 10⁴). Extra eggs beyond about log₂ n never help.
- **Binary search with too few eggs.** "Just binary search the floors" needs about log₂ n eggs. With 2 eggs and 100 floors it fails: if the first egg breaks at floor 50, you have to walk floors 1 to 49 with your last egg. The real answer for 2 eggs and 100 floors is 14.
- **O(k·n²) memo.** It's correct but times out at the limits. Mention it, then improve.

## Say it in the interview

> "The direct recurrence picks a floor x and takes the worse of 'breaks' and 'survives'. That's O(k·n²), or O(k·n·log n) if I binary search x, since one side rises and the other falls. Better: I flip the question. How many floors can m moves and e eggs handle? One drop gives the floors below with one egg fewer, plus the floors above with the same eggs, plus the floor itself. So floors(m, e) = floors(m−1, e−1) + floors(m−1, e) + 1. I grow m until floors(m, k) ≥ n, keeping one row and updating eggs from high to low. That's O(k·m) time and O(k) space."

## Follow-ups interviewers ask

- **"Why is floors(m, k) a sum of binomials?"** Unrolling the recurrence gives `floors(m, k) = C(m, 1) + C(m, 2) + … + C(m, k)`. So you can binary search `m` and evaluate that sum directly: O(k log n).
- **"Classic two eggs, 100 floors: what's the strategy?"** Find the smallest `m` with `m(m+1)/2 ≥ 100`, which is `m = 14`. Drop the first egg at 14, then 27, 39, … (each gap one smaller than the last). Once it breaks, walk up with the second egg.
- **"Return the actual sequence of drops."** Use the table: with `m` moves and `e` eggs left, drop from `floors(m − 1, e − 1) + 1` floors above the current lower bound. Then recurse into whichever side is left.
