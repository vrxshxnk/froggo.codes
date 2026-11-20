---
id: lc-136
title: Single Number
pattern: XOR cancellation
timeBox: 15
summary: Every number in the array appears exactly twice except one; find that one using linear time and constant extra space.
hints:
  - "A hash map of counts solves it in O(n) time, but the problem wants O(1) extra space. Is there an operation that 'forgets' a number when it sees it a second time?"
  - "Look at XOR: what is x ^ x? What is x ^ 0? Does the order you XOR things in matter?"
  - "XOR every number into one running variable. Each pair cancels to 0, and 0 ^ loner = loner."
insight: XOR is its own undo button — x ^ x = 0 and x ^ 0 = x, and order doesn't matter — so XOR-ing the whole array cancels every pair and leaves only the number that appears once.
time: O(n)
space: O(1)
related: [lc-137, lc-191, lc-217, lc-421]
---

## The problem in plain English

You get a non-empty array `nums`. Every value in it appears **exactly twice**, except one value that appears **once**. Return that lonely value.

The catch: do it in O(n) time and **O(1) extra space**. So no hash map, no set, no sorting into a new array.

Numbers can be negative. The array has up to 3 × 10⁴ elements.

Example: `nums = [4, 1, 2, 1, 2]` → `4`. The `1`s pair up, the `2`s pair up, and `4` is alone.

## Start with brute force

For each number, count how many times it appears by scanning the whole array. Return the one whose count is 1. That's O(n²): for n = 3 × 10⁴, about 9 × 10⁸ steps.

The natural upgrade is a hash map of counts (from the Arrays & Hashing stage): one pass to count, one pass to find the count of 1. That's O(n) time, but O(n) space. The problem explicitly forbids that. Sorting and checking neighbours uses O(1) extra space if done in place, but takes O(n log n).

So we need something that remembers "which numbers are still unpaired" in a **single integer**.

## Building the intuition

Imagine a light switch for each number. The first time you see a number, you flip its switch on. The second time, you flip it off. At the end, the only switch still on belongs to the loner.

Is there an operation on integers that behaves like flipping switches? Yes: **XOR** (`^`). It works bit by bit: the result bit is 1 when the two input bits are *different*.

Three facts about XOR do all the work:

| Fact | Example |
|---|---|
| `x ^ 0 = x` | `5 ^ 0 = 5` |
| `x ^ x = 0` | `5 ^ 5 = 0` |
| Order doesn't matter | `a ^ b ^ a = a ^ a ^ b = b` |

So if you XOR the whole array together, you can mentally rearrange it to put every pair side by side. Each pair becomes 0. What's left is `0 ^ 0 ^ … ^ loner = loner`.

Each bit of the running result is literally a light switch: it flips every time a number with that bit set goes past.

## The optimal approach

1. Start with `result = 0`.
2. For each `x` in `nums`, do `result ^= x`.
3. Return `result`.

The subtle detail: **pairs don't need to be next to each other.** XOR is commutative (`a ^ b = b ^ a`) and associative (`(a ^ b) ^ c = a ^ (b ^ c)`), so the final value depends only on *which* numbers went in, not their order. That's why we can cancel `1` with `1` even though a `2` sits between them.

Negative numbers are fine too: XOR works on their bit pattern (two's complement), and `x ^ x = 0` holds for any bit pattern.

{{code}}

## Dry run

`nums = [4, 1, 2, 1, 2]`, shown in binary.

| Step | x | result before | result after (`result ^ x`) |
|---|---|---|---|
| 1 | 4 = `100` | `000` | `100` (4) |
| 2 | 1 = `001` | `100` | `101` (5) |
| 3 | 2 = `010` | `101` | `111` (7) |
| 4 | 1 = `001` | `111` | `110` (6) — the first 1 is undone |
| 5 | 2 = `010` | `110` | `100` (4) — the first 2 is undone |

Result `4`. Notice the middle values (5, 7, 6) look random. Only the end result means anything.

## Complexity

- **Time: O(n).** One pass, one XOR per element.
- **Space: O(1).** One integer, no matter how long the array is.

## Edge cases and traps

- **Single element `[1]`.** `0 ^ 1 = 1`. Works with no special case.
- **The loner is 0.** `[0, 5, 5]` → `0 ^ 5 ^ 5 = 0`. Correct, because the result starts at 0.
- **Negative numbers.** `[-3, 7, -3]` → `7`. XOR doesn't care about signs; it just cancels identical bit patterns.
- **Starting `result` at `nums[0]` and looping from 0.** That XORs the first element twice and cancels it. Start at 0, or start at `nums[0]` and loop from index 1.
- **Using `+` and `-` instead.** "Add if new, subtract if seen" needs a set to know what's been seen. XOR needs no memory.

## Say it in the interview

> "A hash map of counts works in O(n) time but uses O(n) space, and the problem wants constant space. XOR fits perfectly: x XOR x is 0, x XOR 0 is x, and XOR is commutative and associative, so the order doesn't matter. If I XOR every number together, every pair cancels and only the single number survives. That's one pass, O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"What if every other number appears three times?"** XOR no longer cancels triples. Count each bit position modulo 3 instead. That's the next-but-one problem in this stage, *Single Number II*.
- **"What if there are two loners?"** XOR everything to get `a ^ b`. Any set bit in it is a position where `a` and `b` differ. Split the array by that bit and XOR each half separately; each half has one loner.
- **"Find the missing number in 0..n."** XOR all indices 0..n and all values. Everything present cancels, and the missing number remains.
