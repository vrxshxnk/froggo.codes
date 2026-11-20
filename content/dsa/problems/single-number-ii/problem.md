---
id: lc-137
title: Single Number II
pattern: Count each bit modulo 3
timeBox: 25
summary: Every number appears exactly three times except one that appears once; find it in linear time with constant extra space.
hints:
  - "XOR cancels pairs, but three copies of x XOR to x, not 0. So XOR alone won't work. Stop thinking about whole numbers and think about one bit position at a time."
  - "Pick bit position 0. Add up bit 0 across every number in the array. Each tripled number adds either 0 or 3 to that total. What does that tell you about the total modulo 3?"
  - "For each of the 32 bit positions, count how many numbers have that bit set. If the count isn't a multiple of 3, the single number has that bit. Watch the sign bit in Python."
insight: Look at one bit column at a time. The tripled numbers contribute 0 or 3 to each column's count, so count % 3 is exactly the single number's bit in that column. Rebuild the number from its 32 bits.
time: O(32·n) = O(n)
space: O(1)
related: [lc-136, lc-191, lc-371]
---

## The problem in plain English

You get an array `nums`. Every value appears **exactly three times**, except one value that appears **exactly once**. Return that value.

As in *Single Number*, you must use O(n) time and O(1) extra space. Values can be anything in the 32-bit signed range, from −2³¹ to 2³¹ − 1, so negatives matter.

Example: `nums = [0, 1, 0, 1, 0, 1, 99]` → `99`.

## Start with brute force

A hash map of counts finds the value with count 1 in O(n) time, but uses O(n) space. Sorting and scanning in groups of three uses O(1) extra space but O(n log n) time. Neither meets both limits.

The *Single Number* trick fails too. XOR cancels pairs, but `x ^ x ^ x = x`. Three copies leave a copy behind, so XOR-ing everything gives the loner XOR-ed with every tripled number: garbage.

## Building the intuition

XOR worked because, **in each bit column**, it kept a count modulo 2. Pairs added 0 or 2 to a column, and modulo 2 that disappears.

So generalise: keep a count **modulo 3** in each column.

Write `[2, 2, 3, 2]` in binary and stack the numbers up:

```text
        bit1 bit0
2  =     1    0
2  =     1    0
3  =     1    1
2  =     1    0
sum      4    1
sum % 3  1    1   → binary 11 = 3
```

Each number appearing three times adds either 0 (bit off) or 3 (bit on) to a column. Modulo 3, its contribution vanishes. What's left in each column is the single number's bit. Column 1: 4 % 3 = 1. Column 0: 1 % 3 = 1. Reading `11` gives `3`, which is the answer.

There are only 32 columns, so this is 32 passes over the array. That's 32n steps, which is still O(n), and we only need a counter and the result, which is O(1) space.

## The optimal approach

1. `result = 0`.
2. For each `bit` from 0 to 31:
   - count how many numbers have that bit set: add `(x >> bit) & 1` for every `x`;
   - if `count % 3 != 0`, set that bit in the result: `result |= 1 << bit`.
3. Return `result`, read as a signed 32-bit integer.

The subtle detail is **negative numbers**, because the single number might be negative, which means bit 31 is set (two's complement).

- **Java and JavaScript:** setting bit 31 of a 32-bit signed integer makes it negative automatically. Nothing extra to do.
- **C++:** use `uint32_t` for the shifting so it's a plain bit pattern, then cast to `int` at the end.
- **Python:** ints have no fixed width, so `1 << 31` is just the positive number 2,147,483,648. If `result ≥ 2³¹`, subtract 2³² to get the negative value those 32 bits mean. Reading bits *out* of a negative Python int works fine: Python acts as if negatives have infinitely many leading 1s, so `(x >> bit) & 1` gives the right two's complement bit.

{{code}}

## Dry run

`nums = [-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]`. The answer should be `-4`. In 32-bit two's complement, `-2` is `111…1110`, `-4` is `111…1100`, `1` is `…0001` and `4` is `…0100`.

| bit | which numbers have it | count | count % 3 | result bit |
|---|---|---|---|---|
| 0 | the three 1s | 3 | 0 | 0 |
| 1 | the three −2s | 3 | 0 | 0 |
| 2 | three −2s, three 4s, one −4 | 7 | 1 | 1 |
| 3 … 31 | three −2s and one −4 | 4 | 1 | 1 |

The result is bits 2 to 31 set and bits 0 and 1 clear: `111…1100`, which is `-4`. In Python that pattern first comes out as 4,294,967,292; subtracting 2³² gives `-4`.

## Complexity

- **Time: O(n).** Exactly 32 passes of n steps. The 32 is a constant that doesn't grow with the input.
- **Space: O(1).** A counter and the result.

## Edge cases and traps

- **Python returning a huge positive number.** If you forget the sign fix-up, a negative answer like `-4` comes back as `4294967292`.
- **Looping only 31 bits.** Bit 31 is the sign bit. Skip it and every negative answer is wrong.
- **C++ shifting a negative `int` left into the sign bit.** Do the bit-building in `uint32_t`.
- **`INT_MIN` as the loner.** `[5, -2147483648, 5, 5]` has only bit 31 set in the answer. Java and JS handle it; Python must subtract 2³².
- **Single element `[x]`.** Every column count is 0 or 1, so you rebuild `x` exactly.

## Say it in the interview

> "XOR doesn't work, because three copies XOR to the number itself. Instead I look at each of the 32 bit positions separately. Every number that appears three times adds 0 or 3 to that position's count, so count mod 3 is the single number's bit. I rebuild the answer bit by bit. That's 32 passes, so O(n) time, with constant space. I need to treat bit 31 as the sign bit, which in Python means subtracting 2 to the 32 if it's set."

## Follow-ups interviewers ask

- **"Can you do it in one pass?"** Yes: keep two masks, `ones` and `twos`, which together act as a 2-bit counter per column that resets at 3. For each `x`: `ones = (ones ^ x) & ~twos`, then `twos = (twos ^ x) & ~ones`. At the end, `ones` is the answer. Same complexity, fewer passes, but much harder to derive under pressure.
- **"What if every other number appears k times?"** The same bit-counting works with `count % k`.
- **"Why not just sum?"** `3 × sum(set(nums)) − sum(nums) = 2 × loner` works, but building the set costs O(n) space.
