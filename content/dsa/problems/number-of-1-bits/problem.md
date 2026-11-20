---
id: lc-191
title: Number of 1 Bits
pattern: Clear the lowest set bit
timeBox: 15
summary: Count how many 1s appear in the binary form of a positive integer.
hints:
  - "The obvious way checks all 31 bit positions one by one with (n >> i) & 1. That works. Can you make the loop run only as many times as there are 1s?"
  - "Write out n and n - 1 in binary for n = 12 (1100 and 1011). What happens to the lowest 1, and to everything below it?"
  - "n & (n - 1) is n with its lowest 1 turned off. Keep doing that until n is 0, and count the steps."
insight: Subtracting 1 flips the lowest set bit and every 0 below it, so n & (n - 1) deletes exactly one 1. Repeat until n is 0 and the number of steps is the answer.
time: O(k), k = number of set bits (at most 31)
space: O(1)
related: [lc-338, lc-190, lc-136]
---

## The problem in plain English

You get a positive integer `n` (from 1 up to 2³¹ − 1). Return how many of its bits are 1. This count is called the **Hamming weight** or **popcount** ("population count").

Example: `n = 11`. In binary that's `1011`, which has three 1s, so the answer is `3`.

Another: `n = 128` is `10000000`, so the answer is `1`.

## Start with brute force

Check every bit position. For `i` from 0 to 30, the expression `(n >> i) & 1` shifts bit `i` down to the last place and masks off everything else, giving 0 or 1. Add them up.

```python
count = 0
for i in range(31):
    count += (n >> i) & 1
```

This is honestly fine: 31 steps, O(1). It is a perfectly acceptable first answer. But the interviewer usually wants the next idea: **can you skip the zeros?** For `n = 128` the loop does 31 checks to find a single 1.

## Building the intuition

Let's look at what subtracting 1 does in binary. Take `n = 12`:

```text
n     = 1100
n - 1 = 1011
```

Subtracting 1 had to **borrow**. It walked right to left past the 0s, turning each into a 1, until it found the first 1. That 1 became 0. Everything to the left was untouched.

Try another, `n = 10`:

```text
n     = 1010
n - 1 = 1001
```

Same story: the lowest 1 became 0 and the 0 below it became 1.

Now AND them together. Bits to the left are the same in both, so they survive. The lowest 1 and everything below it are *different* in `n` and `n − 1`, so AND makes them all 0:

```text
n & (n - 1) = 1100 & 1011 = 1000
```

**`n & (n − 1)` is `n` with its lowest 1 removed.** Do that repeatedly. Each step deletes exactly one 1, and when `n` reaches 0 there are none left. The number of steps is the count. This is known as Brian Kernighan's trick.

## The optimal approach

1. Set `count = 0`.
2. While `n` is not 0:
   - `n &= n - 1` (remove the lowest 1);
   - `count += 1`.
3. Return `count`.

The subtle detail: the loop runs once per **set bit**, not once per bit position. `128` takes 1 iteration, not 31. Only `2³¹ − 1` (all 31 bits set) uses the full 31.

{{code}}

## Dry run

`n = 11` (`1011`)

| Step | n (binary) | n − 1 | n & (n − 1) | count |
|---|---|---|---|---|
| 1 | `1011` | `1010` | `1010` | 1 |
| 2 | `1010` | `1001` | `1000` | 2 |
| 3 | `1000` | `0111` | `0000` | 3 |
| — | `0000` | | loop ends | **3** |

Three iterations for three 1s.

## Complexity

- **Time: O(k)**, where k is the number of 1 bits. At most 31 for this problem, so it's O(1) in absolute terms.
- **Space: O(1).** Just the counter.

## Edge cases and traps

- **LeetCode's signature changed.** Older versions of this problem passed an *unsigned* 32-bit integer, and old solutions write `uint32_t` or talk about Java's `>>>`. Today it's a plain positive `int`, so the sign bit is never set.
- **If the sign bit could be set (Java/JS).** The `n & (n - 1)` loop still works, because it never shifts. A shift-based loop would need `>>>`, since `>>` copies the sign bit forever and loops endlessly.
- **Python negative numbers.** Python ints have no fixed width, so `-1` has "infinitely many" 1s and the loop never ends. Mask first with `n & 0xFFFFFFFF` if negatives were allowed.
- **Writing `n & n - 1` without thinking about precedence.** In Python, `-` binds tighter than `&`, so it's fine. In C++, Java and JS it's also fine. With other mixes like `n & 1 == 0`, the `==` wins in C-style languages. Parenthesise when unsure.
- **Built-ins.** `bin(n).count("1")`, `__builtin_popcount`, `Integer.bitCount` exist. Mention them, but show the loop.

## Say it in the interview

> "The simple version checks all 31 positions with a shift and a mask. That's already constant time, but I can do better: n AND n minus 1 clears the lowest set bit, because subtracting 1 flips that bit and all the zeros below it. So I keep clearing the lowest bit until n is zero and count the iterations. The loop runs once per set bit, with constant space."

## Follow-ups interviewers ask

- **"This is called millions of times. Speed it up?"** Precompute the count for every 8-bit value (a 256-entry table) and add four table lookups, one per byte. Or use the hardware popcount instruction through the language's built-in.
- **"Count bits for every number from 0 to n?"** Don't loop each one separately. Reuse earlier answers: that's *Counting Bits*, next in this stage.
- **"Check if n is a power of two."** A power of two has exactly one 1, so `n > 0 and n & (n - 1) == 0`.
