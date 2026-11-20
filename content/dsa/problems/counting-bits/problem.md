---
id: lc-338
title: Counting Bits
pattern: Bit DP from a smaller number
timeBox: 15
summary: For every number from 0 to n, return how many 1 bits it has, ideally in one linear pass.
hints:
  - "Counting each number's bits separately costs O(log n) per number. Can the answer for i be built from the answer for a smaller number you've already computed?"
  - "What does i >> 1 look like next to i in binary? For i = 13 (1101), i >> 1 is 6 (110). What's the only bit that differs?"
  - "ans[i] = ans[i >> 1] + (i & 1). Shifting right drops the last bit; add it back if it was a 1."
insight: i >> 1 is i with its last bit chopped off, and it's smaller than i, so its count is already in the table. Add back the chopped bit (i & 1) and you're done in O(1) per number.
time: O(n)
space: O(1) extra (the output array is O(n))
related: [lc-191, lc-70, lc-198]
---

## The problem in plain English

You get a non-negative integer `n` (up to 10⁵). Return an array `ans` of length `n + 1` where `ans[i]` is the number of 1s in the binary form of `i`, for every `i` from 0 to `n`.

Example: `n = 5` → `[0, 1, 1, 2, 1, 2]`.

| i | binary | ones |
|---|---|---|
| 0 | `0` | 0 |
| 1 | `1` | 1 |
| 2 | `10` | 1 |
| 3 | `11` | 2 |
| 4 | `100` | 1 |
| 5 | `101` | 2 |

## Start with brute force

Run the *Number of 1 Bits* loop on every `i`. Each number has about log₂(n) bits, so this is O(n log n). For n = 10⁵ that's roughly 1.7 million steps. It's fast enough in practice, but the problem's follow-up asks for **O(n) in a single pass**, and that's what interviewers want to see.

## Building the intuition

We're filling a table from 0 upward. When we reach `i`, every smaller number is already done. That's the setup for **dynamic programming**: answer a big question using answers to smaller ones you've stored.

So which smaller number is closely related to `i` in binary? Try shifting right by one, `i >> 1`. That drops the last bit:

```text
i      = 13 = 1101
i >> 1 =  6 =  110
```

The two numbers share every bit except the last one, which `i` has and `i >> 1` threw away. So:

- the number of 1s in `13` = the number of 1s in `6` + (was the dropped bit a 1?)
- = `ans[6] + (13 & 1)` = `2 + 1` = `3`. Check: `1101` has three 1s. ✓

`i & 1` is the last bit of `i`: 1 for odd numbers, 0 for even. And `i >> 1` is always smaller than `i` (for `i ≥ 1`), so its answer is already in the table.

## The optimal approach

1. Create `ans` of size `n + 1`, filled with 0. `ans[0] = 0` because 0 has no 1s.
2. For `i` from 1 to `n`: `ans[i] = ans[i >> 1] + (i & 1)`.
3. Return `ans`.

The subtle detail is **why this order is safe**: we only ever read `ans[i >> 1]`, and `i >> 1 < i`. So walking upward always reads a slot that's already filled.

A second recurrence works just as well: `ans[i] = ans[i & (i - 1)] + 1`. Here `i & (i − 1)` removes the lowest 1 (the trick from *Number of 1 Bits*), giving a smaller number with exactly one fewer 1.

{{code}}

## Dry run

`n = 5`

| i | binary | i >> 1 | ans[i >> 1] | i & 1 | ans[i] |
|---|---|---|---|---|---|
| 0 | `0` | — | — | — | 0 (base case) |
| 1 | `1` | 0 | 0 | 1 | 1 |
| 2 | `10` | 1 | 1 | 0 | 1 |
| 3 | `11` | 1 | 1 | 1 | 2 |
| 4 | `100` | 2 | 1 | 0 | 1 |
| 5 | `101` | 2 | 1 | 1 | 2 |

Result: `[0, 1, 1, 2, 1, 2]`. Each row reads only a row above it.

## Complexity

- **Time: O(n).** One O(1) step per number.
- **Space: O(1) extra.** The output array is required by the problem. Nothing else is stored.

## Edge cases and traps

- **`n = 0`.** Return `[0]`, an array of length 1, not an empty array.
- **Off-by-one in the size.** The array has `n + 1` entries (0 through n). Allocating `n` crashes on the last index.
- **Starting the loop at 0.** `0 >> 1` is 0, so `ans[0] = ans[0] + 0` is harmless. But starting at 1 makes the base case explicit.
- **Precedence in `ans[i >> 1] + (i & 1)`.** Without the parentheses, C-style languages parse `ans[i >> 1] + i & 1` as `(ans[i >> 1] + i) & 1`, because `+` binds tighter than `&`. Always bracket `i & 1`.
- **Using `i / 2`.** It works for non-negative `i`, but `i >> 1` says what you mean: drop the last bit.

## Say it in the interview

> "I could count each number separately in O(n log n). Instead I'll reuse earlier answers. i shifted right by one is i without its last bit, and it's smaller than i, so I've already computed it. So ans[i] equals ans[i >> 1] plus i AND 1, which adds back the dropped bit. One pass, O(n) time, and no extra space beyond the output."

## Follow-ups interviewers ask

- **"Another recurrence?"** `ans[i] = ans[i & (i - 1)] + 1`: drop the lowest 1 and add it back. Or use powers of two: `ans[i] = ans[i - offset] + 1`, where `offset` is the largest power of two ≤ `i`.
- **"Why is this DP?"** Each answer is built from a smaller stored answer, and the evaluation order guarantees it's ready. It's the same shape as *Climbing Stairs*, just with a bit operation choosing which earlier entry to read.
- **"Without the table, for one number?"** That's *Number of 1 Bits*: `n &= n - 1` in a loop.
