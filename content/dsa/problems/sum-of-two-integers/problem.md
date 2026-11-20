---
id: lc-371
title: Sum of Two Integers
pattern: XOR adds, AND carries
timeBox: 25
summary: Add two integers without using the + or - operators.
hints:
  - "Do binary addition by hand, column by column, like school addition but in base 2. In each column, when is the sum bit 1, and when do you carry?"
  - "Without carries, the sum bit is 1 exactly when the two bits differ: that's XOR. A carry appears exactly where both bits are 1: that's AND, moved one place left."
  - "Loop: carry = (a & b) << 1, a = a ^ b, b = carry, until b is 0. In Python, mask to 32 bits, because ints there never overflow."
insight: Addition splits into two bit operations — a ^ b is the sum ignoring carries, and (a & b) << 1 is exactly the carries. Add those two the same way, again and again, until no carry is left.
time: O(1) (at most 32 rounds)
space: O(1)
related: [lc-136, lc-190, lc-2]
---

## The problem in plain English

You get two integers `a` and `b`. Return `a + b`, but you're **not allowed to use `+` or `-`**. On LeetCode both are between −1000 and 1000, but a good answer works for any 32-bit integers, and the code below does.

Example: `a = 2`, `b = 3` → `5`.

This sounds like a trick question, and it is a little. It's really asking: do you know how a computer adds?

## Start with brute force

You could "count up": increment `a` one step at a time, `b` times. But incrementing is `+ 1`, which is banned. Even with a loophole like `a.__add__`, it's O(|b|) and doesn't handle negatives cleanly.

The honest brute force is to **simulate a full adder**: walk the 32 bit positions one by one, keep a carry bit, and compute each sum bit from `bit_a`, `bit_b` and `carry`. That works in 32 steps and uses only bit operations. It's a good answer. But there's a neater version that handles all 32 columns at once.

## Building the intuition

Add `5 + 3` by hand in binary:

```text
   101   (5)
 + 011   (3)
 -----
  1000   (8)
```

Look at a single column with no incoming carry. There are four cases:

| bit a | bit b | sum bit | carry out |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

The "sum bit" column is exactly **XOR**. The "carry" column is exactly **AND**, and the carry lands in the column to the *left*, so shift it: `(a & b) << 1`.

So `a + b = (a ^ b) + ((a & b) << 1)`. We still have a `+` in there... but it's adding two new numbers the same way. Apply the same rule to them. Each round, the carry moves at least one place left, so after at most 32 rounds it falls off the end and becomes 0. Then the XOR part is the whole answer.

## The optimal approach

1. While `b != 0`:
   - `carry = (a & b) << 1`: every column where both are 1 sends a 1 left;
   - `a = a ^ b`: the sum of every column, ignoring carries;
   - `b = carry`: now we need to add the carries.
2. Return `a`.

The subtle detail is **negative numbers**, which use two's complement (−1 is all 32 bits set). This affects languages differently:

- **Java and JavaScript:** bitwise ops are on 32-bit signed integers. A carry shifted past bit 31 simply disappears, so the loop always ends and negatives come out right.
- **C++:** do the work in `uint32_t`, because shifting a 1 into the sign bit of a signed `int` was undefined behaviour before C++20. Cast back to `int` at the end.
- **Python:** ints have **no fixed width**. With `-1 + 1`, the carry keeps moving left forever and the loop never ends. Fix: mask everything with `0xFFFFFFFF` to act like a 32-bit register. At the end, if bit 31 is set, the pattern means a negative number, so subtract 2³².

{{code}}

## Dry run

`a = 5` (`0101`), `b = 3` (`0011`)

| Round | a | b | carry = (a & b) << 1 | new a = a ^ b | new b |
|---|---|---|---|---|---|
| 1 | `0101` | `0011` | `0010` | `0110` | `0010` |
| 2 | `0110` | `0010` | `0100` | `0100` | `0100` |
| 3 | `0100` | `0100` | `1000` | `0000` | `1000` |
| 4 | `0000` | `1000` | `0000` | `1000` | `0000` |

`b` is 0, so return `a = 1000` = 8. ✓ Each round the carry moved one column left.

Now a negative one, `-1 + 1` in 32 bits. `-1` is `111…111`. Round 1: carry `000…010`, a `111…110`. Round 2: carry `000…100`, a `111…100`. The carry marches left, eating one 1 per round, until after 32 rounds it slides off bit 31 and `a` is 0. In Python without the mask, the carry would keep marching forever.

## Complexity

- **Time: O(1).** Each round moves the lowest carry bit at least one place left, so there are at most 32 rounds.
- **Space: O(1).** A few integers.

## Edge cases and traps

- **Python infinite loop on negatives.** The number-one bug. Mask with `0xFFFFFFFF`, then convert back with `a - (1 << 32)` if `a > 0x7FFFFFFF`.
- **Forgetting the final conversion in Python.** Without it, `-2` comes back as `4294967294`.
- **Updating `a` before computing the carry.** The carry needs the *old* `a`. Compute `carry` first, or use a temporary.
- **Shifting the carry the wrong way.** Carries go to the higher column: `<< 1`, never `>> 1`.
- **Zero.** `0 + 0` skips the loop and returns 0. `a + 0` also returns immediately.

## Say it in the interview

> "In binary, XOR gives the sum of each column ignoring carries, and AND shifted left by one gives exactly the carries. So a plus b equals a XOR b plus the carry, and I add those two the same way, in a loop, until the carry is zero. The carry moves left every round, so there are at most 32 rounds, which is constant time. In Java the 32-bit overflow handles negatives for me. In Python I'd mask to 32 bits and convert back at the end, because Python ints don't overflow."

## Follow-ups interviewers ask

- **"How do you subtract?"** `a − b = a + (~b + 1)`, because `~b + 1` is `−b` in two's complement. Do the `+ 1` with the same loop.
- **"Why does the loop terminate?"** The lowest set bit of the carry moves left by at least one each round, so within 32 rounds it falls off the 32-bit word.
- **"Multiply without `*`?"** Shift-and-add: for each set bit `i` of `b`, add `a << i`, using this addition.
