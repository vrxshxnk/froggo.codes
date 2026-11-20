---
id: lc-9
title: Palindrome Number
pattern: Peel digits with % 10 and / 10
timeBox: 15
summary: Decide whether an integer reads the same forwards and backwards, ideally without turning it into a string.
hints:
  - "Can a negative number ever be a palindrome? Think about where the minus sign ends up when you read -121 backwards."
  - "x % 10 gives you the last digit of x, and x / 10 (integer division) chops that digit off. Repeat until nothing is left."
  - "Build the reversed number digit by digit: rev = rev * 10 + last digit. Then compare it with the original. Use a 64-bit type, because reversing a big int can overflow."
insight: "Two tiny operations take a number apart: % 10 reads the last digit and integer division by 10 removes it. Feed those digits into rev = rev * 10 + digit and you've reversed the number with pure maths."
time: O(log x)
space: O(1)
related: [lc-66, lc-125, lc-412]
---

## The problem in plain English

You get an integer `x`, which can be anywhere in the 32-bit range (about −2.1 billion to +2.1 billion). Return `true` if it reads the same from left to right as from right to left, and `false` otherwise.

Examples: `121` → `true`. `-121` → `false`, because backwards it reads `121-`. `10` → `false`, because backwards it reads `01`.

## Start with brute force

Turn `x` into a string and compare it with its reverse: `str(x) == str(x)[::-1]`. It's correct and fast, but LeetCode's follow-up asks you to do it **without a string**, and interviewers often do too. Working with digits directly is a skill you'll reuse in *Plus One*.

## Building the intuition

How do you get at the digits of a number without a string? Try it on `123`:

- `123 % 10` is `3`. The remainder after dividing by 10 is always the **last digit**.
- `123 / 10` is `12` in integer division. Dividing by 10 **removes the last digit**.

Repeat and you get `3`, `2`, `1`: the digits right to left, which is exactly the reversed order. Now build it up. Start with `rev = 0`, and for each digit do `rev = rev * 10 + digit`. Multiplying by 10 shifts everything one place left to make room for the new digit: `0 → 3 → 32 → 321`. A palindrome is a number that equals its own reverse.

## The optimal approach

1. If `x < 0`, return `false`. The minus sign can't appear at the end.
2. Save `original = x` and set `rev = 0` (short for "reversed").
3. While `x > 0`: `rev = rev * 10 + x % 10`, then `x = x / 10` (integer division).
4. Return `rev == original`.

The subtle detail is **overflow**. `2147483647` fits in an `int`, but its reverse, `7463847412`, doesn't. In C++ and Java, store `rev` in a 64-bit `long long` / `long`. Python and JavaScript don't have this problem at this size.

{{code}}

## Dry run

`x = 121`

| x before | digit = x % 10 | rev after | x after |
|---|---|---|---|
| 121 | 1 | 1 | 12 |
| 12 | 2 | 12 | 1 |
| 1 | 1 | 121 | 0 |

`x` is now 0, so we stop. `rev = 121` equals `original = 121`, so the answer is `true`.

## Complexity

- **Time: O(log x).** We do one step per digit, and a number `x` has about log₁₀(x) digits. At most 10 steps here.
- **Space: O(1).** Three integer variables.

## Edge cases and traps

- **Negative numbers.** Always `false`. Check it explicitly rather than relying on the loop.
- **Zero.** A palindrome: the loop doesn't run and `0 == 0`.
- **Trailing zeros.** `10` reverses to `1`, so it's correctly `false`.
- **Overflow in C++/Java.** An `int` reversed can exceed 2³¹ − 1. Use 64 bits.
- **`/` in Python and JavaScript.** Python needs `//` for integer division. JavaScript needs `Math.floor(x / 10)`.

## Say it in the interview

> "Negatives can't be palindromes, so I return false. Otherwise I reverse the number with maths: mod 10 gives the last digit, dividing by 10 removes it, and rev times 10 plus the digit appends it. Then I compare. O(log x) time, O(1) space, and a 64-bit reverse so it can't overflow."

## Follow-ups interviewers ask

- **"What if you can't use a 64-bit type?"** Reverse only **half** the digits. Stop when `rev >= x`; then compare `x == rev` (even length) or `x == rev / 10` (odd length, the middle digit doesn't matter). Half a number's digits can't overflow. Reject numbers ending in 0 first, except 0 itself.
