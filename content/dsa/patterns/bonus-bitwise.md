---
module: bonus-bitwise
title: Bit Manipulation
readTime: 9
summary: Six short problems that teach you to think in binary. XOR cancellation, clearing the lowest set bit, and two's complement arithmetic turn "count it with a hash map" into one integer and a loop.
---

## Why this stage matters

Most of the roadmap trades memory for speed: a hash map here, a DP table there. Bit manipulation goes the other way. It treats one integer as **32 tiny boolean switches** and works on all of them at once, in O(1) space.

These problems are short, and interviewers often use one as a warm-up before the main question. A fumbled warm-up costs you time and confidence. A crisp one, saying "XOR cancels pairs" in ten seconds, buys you both.

## Binary in one minute

Decimal digits stand for 1, 10, 100, …. Binary digits (**bits**) stand for 1, 2, 4, 8, 16, …, and each one is 0 or 1.

```text
13 = 8 + 4 + 1 = 1101
      bit3 bit2 bit1 bit0
        1    1    0    1
```

Bit 0 is the rightmost (the "lowest"). An `int` in C++, Java and JavaScript's bitwise operators has 32 bits, numbered 0 to 31.

Two facts you'll use constantly:

- `1 << k` is a number with only bit k set (`1 << 3 = 1000 = 8`).
- `(x >> k) & 1` reads bit k of x: shift it down to position 0, then keep only that bit.

## The operators

| Operator | Name | Rule, bit by bit | `12 op 10` (`1100`, `1010`) |
|---|---|---|---|
| `a & b` | AND | 1 if **both** are 1 | `1000` = 8 |
| `a \| b` | OR | 1 if **either** is 1 | `1110` = 14 |
| `a ^ b` | XOR | 1 if they **differ** | `0110` = 6 |
| `~a` | NOT | flip every bit | `~12 = −13` |
| `a << k` | left shift | move bits left, fill with 0 (× 2ᵏ) | `12 << 1 = 24` |
| `a >> k` | right shift | move bits right (÷ 2ᵏ, rounding down) | `12 >> 2 = 3` |

Everyday uses: `x & 1` tells you if x is odd. `x | (1 << k)` sets bit k. `x & ~(1 << k)` clears it. `x ^ (1 << k)` flips it.

## The core ideas and their templates

### 1. XOR cancellation

Think of XOR as a light switch. Flip it twice and you're back where you started. Precisely:

```text
x ^ x = 0        x ^ 0 = x        order doesn't matter
```

So XOR-ing a list together cancels every value that appears an even number of times. That's *Single Number* in one line. It's also the first half of *Sum of Two Integers*: `a ^ b` is addition with the carries ignored.

```python
result = 0
for x in nums:
    result ^= x        # pairs cancel; the odd one out survives
```

Use it when: "every element appears twice except…", "find the missing number", or "pair things up without extra memory".

### 2. `x & (x − 1)` clears the lowest set bit

Subtracting 1 borrows: it turns the lowest 1 into a 0 and every 0 below it into a 1. AND-ing with the original wipes out that whole tail.

```text
x         = 10100
x - 1     = 10011
x & (x-1) = 10000
```

```python
count = 0
while x:
    x &= x - 1         # remove one set bit per iteration
    count += 1
```

Use it when: counting set bits (*Number of 1 Bits*), checking for a power of two (`x > 0 and x & (x - 1) == 0`), or building counts from smaller numbers (*Counting Bits*).

### 3. One bit column at a time

When a trick about whole numbers breaks, look at each of the 32 bit positions separately. *Single Number II* counts how many numbers have bit k set. Tripled numbers add a multiple of 3, so `count % 3` is the loner's bit. *Reverse Bits* moves bits one at a time from one number to another.

```python
result = 0
for bit in range(32):
    count = sum((x >> bit) & 1 for x in nums)
    if count % 3:
        result |= 1 << bit
```

### 4. Two's complement

How do 32 bits store negative numbers? Bit 31 counts as **−2³¹** instead of +2³¹. So:

- `-1` is all 32 bits set: `−2³¹ + (2³¹ − 1) = −1`;
- `INT_MIN` (−2,147,483,648) is just bit 31: `1000…0`;
- `−x = ~x + 1`. Flip every bit and add one.

The big win: the CPU adds negative numbers with exactly the same circuit as positive ones. That's why *Sum of Two Integers* works for negatives with no special case. Carries that run off bit 31 simply disappear.

## The language differences that bite

The same bit trick can behave differently per language. These differences are where most bugs in this stage come from.

| Language | What to know |
|---|---|
| **Python** | Ints are **unbounded**: no 32-bit limit, no overflow. Negatives act as if they had infinitely many leading 1s. So `while x: x &= x - 1` never ends when x is negative, and a negative carry in *Sum of Two Integers* loops forever. Fix: mask with `x & 0xFFFFFFFF`, and turn a result with bit 31 set back into a negative with `x - (1 << 32)`. |
| **Java** | `int` is 32-bit two's complement. `>>` is an **arithmetic** shift that copies the sign bit (`-8 >> 1 = -4`). `>>>` is a **logical** shift that fills with 0s (`-8 >>> 1 = 2147483644`). When you treat an int as raw bits, as in *Reverse Bits*, use `>>>`. |
| **JavaScript** | Numbers are 64-bit floats, but every bitwise operator first converts to a **signed 32-bit** int and returns one. So `1 << 31` is `-2147483648`. Use `>>>` for logical shifts, and `x >>> 0` to read the 32 bits as an unsigned value. Bit tricks above 32 bits silently break. |
| **C++** | `int` is 32-bit signed. Shifting a 1 into the sign bit or shifting a negative left was undefined behaviour before C++20, and `>>` on a negative was implementation-defined. When you want plain bit patterns, use `uint32_t`: shifts are always logical and well defined. Cast back to `int` at the end. |

## How to recognise this pattern

- "Without extra space", and the brute force is a hash map of counts.
- "Every element appears twice / three times except one."
- "Count the 1 bits", "power of two", "Hamming distance".
- "Without using `+`, `-`, `*` or `/`."
- "Reverse / rotate / swap the bits."
- "Maximum XOR": this one pairs bits with a trie, in the Tries stage.

## The mistakes everyone makes

1. **Operator precedence.** In C++, Java and JS, `x & 1 == 0` is parsed as `x & (1 == 0)` (Java refuses to compile it; C++ quietly gets it wrong). Always write `(x & 1) == 0`. And `a + b & 1` means `(a + b) & 1`.
2. **Stopping a bit loop early.** *Reverse Bits* must run exactly 32 times, even after the input becomes 0. The leading zeros matter.
3. **Python's missing sign bit.** Results with bit 31 set come back as big positive numbers. Convert them.
4. **`>>` instead of `>>>`** in Java and JS when the sign bit might be set.
5. **Shifting by 32 or more.** In C++ it's undefined. In Java and JS, the shift amount is taken mod 32, so `1 << 32` is `1`.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Single Number | XOR cancellation: pairs vanish |
| Number of 1 Bits | `n & (n − 1)` removes the lowest set bit |
| Counting Bits | DP on bits: `ans[i] = ans[i >> 1] + (i & 1)` |
| Reverse Bits | Shift out, shift in; signed vs unsigned shifts |
| Single Number II | Count each bit column modulo 3; rebuild the sign bit |
| Sum of Two Integers | XOR adds, AND carries; two's complement in practice |

Try each one for its time box before opening the walkthrough. Write out the binary on paper for a small example. These tricks stick once you've seen the bits move with your own eyes.
