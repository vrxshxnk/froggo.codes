---
id: lc-190
title: Reverse Bits
pattern: Shift out, shift in
timeBox: 15
summary: Reverse the order of the 32 bits of an integer, so bit 0 becomes bit 31 and so on, and return the resulting number.
hints:
  - "Think of n as exactly 32 bits, including the leading zeros. Reversing means the last bit of n becomes the first bit of the result."
  - "You can read n's last bit with n & 1 and throw it away with n >> 1. How do you add a bit to the right end of result?"
  - "Repeat 32 times: result = (result << 1) | (n & 1), then n >>= 1. The bit you pull out first gets pushed furthest left."
insight: Treat n and result like two stacks of bits. Pop n's lowest bit and push it onto result's low end, 32 times. The first bit popped ends up on top, at bit 31, which is exactly the reversal.
time: O(1) (always 32 steps)
space: O(1)
related: [lc-191, lc-136, lc-371]
---

## The problem in plain English

You get an integer `n`. Look at it as **exactly 32 bits**, leading zeros included. Reverse the order of those bits, so the bit in position 0 (the far right) moves to position 31 (the far left), position 1 moves to 30, and so on. Return the number those reversed bits make.

On LeetCode today, `n` is an even number between 0 and 2³¹ − 2, and the signature uses a plain `int`. Because `n` is even, its last bit is 0, so the reversed number's top bit is 0 and the answer always fits in a signed `int`. (Older versions of this problem passed an unsigned 32-bit value instead. The code below handles both.)

Example: `n = 43261596`.

```text
n      = 00000010100101000001111010011100
result = 00111001011110000010100101000000  = 964176192
```

## Start with brute force

Convert `n` to a 32-character binary string, padded with leading zeros. Reverse the string. Parse it back to a number. In Python: `int(format(n, "032b")[::-1], 2)`.

It's correct and only 32 characters long, so it's even O(1). But it allocates strings and dodges the point of the question, which is to show you can move bits around with shifts and masks. Interviewers ask this one to see `<<`, `>>`, `&` and `|` used fluently.

## Building the intuition

To reverse a stack of plates, move them one at a time onto a second stack. The plate that was on top of the first stack ends up at the bottom of the second. Nobody has to think about positions; the moving does the reversing.

Bits work the same way, with two operations:

- **Read and remove n's lowest bit:** `n & 1` reads it, `n >> 1` removes it.
- **Append a bit to result's low end:** `result << 1` makes an empty slot on the right, then `| bit` fills it.

Each time we append, every bit already in `result` moves one place left. So the first bit we take from `n` (its bit 0) gets pushed left 31 more times and lands at bit 31. The last bit we take (n's bit 31) lands at bit 0. That's the reversal.

The key is to do it **exactly 32 times**, not "while n is non-zero". Leading zeros of `n` become trailing zeros of the result, and they still need their 32 shifts.

## The optimal approach

1. `result = 0`.
2. Repeat 32 times:
   - `result = (result << 1) | (n & 1)`: make room, drop in n's last bit;
   - `n >>= 1`: discard that bit from `n`.
3. Return `result`.

The subtle detail is **signedness**, and it differs by language:

- **Java:** shift `n` with `>>>`, which brings in 0s. `>>` copies the sign bit, which would feed fake 1s in if bit 31 were set.
- **JavaScript:** bitwise results are signed 32-bit, so `result` may come out negative. `result >>> 0` reinterprets the same bits as unsigned.
- **C++:** copy into a `uint32_t`, so shifts are plain bit moves and pushing a 1 into bit 31 is well defined.
- **Python:** `n` is never negative here, and Python ints never overflow, so plain `>>` and `<<` are fine.

{{code}}

## Dry run

The full run is 32 rows, so here is the same loop on a 4-bit version: reverse `n = 0110` (6) into 4 bits.

| Step | n before | n & 1 | result after `(result << 1) \| bit` | n after `>> 1` |
|---|---|---|---|---|
| 1 | `0110` | 0 | `0000` | `0011` |
| 2 | `0011` | 1 | `0001` | `0001` |
| 3 | `0001` | 1 | `0011` | `0000` |
| 4 | `0000` | 0 | `0110` | `0000` |

`0110` reversed is `0110` (it's a palindrome). Notice step 4: `n` was already 0, but we still shifted. Stopping early would have returned `0011`, which is wrong. With 32 bits, the same loop turns `2` (`…0010`) into `1073741824` (`0100…0`).

## Complexity

- **Time: O(1).** Always exactly 32 iterations, whatever the input.
- **Space: O(1).** Two integers.

## Edge cases and traps

- **Stopping when `n` becomes 0.** The most common bug. Leading zeros matter; always loop 32 times.
- **`>>` vs `>>>` in Java and JS.** With the sign bit set, `>>` keeps copying 1s in from the left.
- **JS returning a negative number.** If bit 31 of the result is set, JS shows it as negative. Return `result >>> 0` for the unsigned value.
- **C++ signed shifts.** Shifting a 1 into the sign bit of an `int` was undefined behaviour before C++20. Use `uint32_t`.
- **`n = 0`.** Returns 0 after 32 harmless iterations.

## Say it in the interview

> "I'll treat n as 32 bits. Thirty-two times, I take n's lowest bit with n AND 1, shift result left to make room and OR the bit in, then shift n right. The first bit I take gets pushed furthest left, so the order reverses. I must loop exactly 32 times, not until n is zero, or I'd lose the leading zeros. In Java I'd use the unsigned shift so the sign bit doesn't leak in. It's constant time and space."

## Follow-ups interviewers ask

- **"Called millions of times — optimise?"** Cache the reversal of every byte (256 entries). Then reverse the four bytes' order and look each one up: four lookups instead of 32 steps.
- **"Do it without a loop?"** Swap halves with masks: swap the 16-bit halves, then the bytes inside each half, then nibbles, pairs, and single bits. That's five mask-and-shift lines, O(1).
- **"Check if a number's bits are a palindrome."** Compare `n` with its reversal over the number's real width.
