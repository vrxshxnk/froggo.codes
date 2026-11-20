---
id: lc-421
title: Maximum XOR of Two Numbers in an Array
pattern: Binary trie, greedy opposite bit
timeBox: 25
summary: Find the largest value of nums[i] XOR nums[j] over all pairs in the array.
hints:
  - "XOR is big when the two numbers differ in the high bits. A 1 in bit 30 is worth more than all lower bits combined. So for a given x, which partner do you want?"
  - "For x, you want a partner whose bits are the opposite of x's, starting from the highest bit and going down. A trie lets you ask 'does any number start with these bits?'"
  - "Insert every number into a binary trie, highest bit first. To query x, walk down choosing the opposite of x's bit whenever that child exists, and record a 1 in the answer for that bit; otherwise follow the same bit."
insight: Build a trie of the numbers' bits, highest bit first. For each x, walk down taking the opposite bit whenever possible. Since a high bit outweighs all lower bits together, this greedy walk finds x's best partner in 31 steps.
time: O(31 · n) = O(n)
space: O(31 · n)
related: [lc-136, lc-208, lc-1268, lc-371]
---

## The problem in plain English

You get an array `nums` of non-negative integers, each less than 2³¹. Return the **maximum** of `nums[i] XOR nums[j]` over all pairs `i, j`. (`i = j` is allowed and gives 0, so the answer is at least 0.) The array can have up to 2 × 10⁵ numbers.

Example: `nums = [3, 10, 5, 25, 2, 8]` → `28`, from `5 XOR 25`:

```text
 5 = 00101
25 = 11001
XOR  11100 = 28
```

## Start with brute force

Try every pair and keep the largest XOR. That's n²/2 pairs: for n = 2 × 10⁵, about 2 × 10¹⁰ XORs. Far too slow.

## Building the intuition

Fix one number `x`. Which partner `y` makes `x ^ y` biggest?

XOR gives a 1 wherever the bits **differ**. And in binary, one high bit beats everything below it: `10000` (16) is bigger than `01111` (15). So the most important thing is to make the **highest** bit of `x ^ y` a 1. Only once that's settled does the next bit matter, and so on.

That's a greedy plan. Look at x's bits from bit 30 down to bit 0, and at each step prefer a partner whose bit is the **opposite** of x's:

- if some number in the array matches all our choices so far **and** has the opposite bit here, take it: this bit of the answer is 1;
- otherwise, we're forced to take the same bit: this bit of the answer is 0.

The question at each step is "does any number start with this pattern of bits?" That's exactly what a trie answers: *Implement Trie*'s `startsWith`, but with an alphabet of two letters, 0 and 1. Each number becomes a 31-letter word read from its highest bit.

Why must the bits go **from high to low**? Because that's the order of importance. Greedy is safe only when an early choice can never be outweighed by later ones, and a 1 at bit k is worth more than bits k−1 to 0 combined.

## The optimal approach

1. Create an empty binary trie. Each node has two children, `children[0]` and `children[1]`.
2. For each `x` in `nums`:
   - **Insert `x`:** for `bit` from 30 down to 0, let `b = (x >> bit) & 1`, create the child if needed, and move into it.
   - **Query `x`:** start at the root with `cur = 0`. For each `bit` from 30 down to 0, let `b` be x's bit. If `children[1 − b]` exists, set that bit in `cur` (`cur |= 1 << bit`) and move there. Otherwise move to `children[b]`.
   - `best = max(best, cur)`.
3. Return `best`.

The subtle detail: we **insert x before querying it**. That way the trie is never empty, and the fallback `children[b]` always exists (x's own path is there). Every pair is still covered: when the later number of a pair is queried, the earlier one is already in the trie.

Why 31 bits? The values are below 2³¹, so bit 30 is the highest bit that can be set.

{{code}}

## Dry run

To keep it small, use 5 bits (bits 4 to 0) and `nums = [3, 10, 5, 25]`, all already inserted. Query `x = 5` (`00101`):

| bit | x's bit | want | exists? | go to | cur |
|---|---|---|---|---|---|
| 4 | 0 | 1 | yes (25 = `11001`) | 1 | `10000` |
| 3 | 0 | 1 | yes (25) | 1 | `11000` |
| 2 | 1 | 0 | yes (25) | 0 | `11100` |
| 1 | 0 | 1 | no (only 25 is left, and its bit 1 is 0) | 0 | `11100` |
| 0 | 1 | 0 | no (25's bit 0 is 1) | 1 | `11100` |

`cur = 28`, matching `5 XOR 25`. The query walked to 25 without ever comparing 5 with 3 or 10 directly.

## Complexity

- **Time: O(31 · n) = O(n).** Each number is inserted and queried once, 31 steps each.
- **Space: O(31 · n).** In the worst case each number adds up to 31 new nodes. Shared high bits make it smaller in practice.

## Edge cases and traps

- **One element.** The only pair is `x ^ x = 0`. Inserting before querying returns 0 correctly.
- **All equal, like `[7, 7, 7]`.** Every XOR is 0. Works.
- **Going from the low bit up.** The greedy only works high to low. Low to high can sacrifice a high bit for a low one.
- **Querying before any insert.** If you query first, the trie is empty and `children[b]` can be null. Insert first, or handle the empty case.
- **Python speed.** 2 × 10⁵ numbers × 31 bits × 2 walks is about 12 million steps. In Python, a plain dict per node, as below, is several times faster than a class with a two-slot list. The alternative in the Follow-ups is faster still.

## Say it in the interview

> "Brute force over pairs is O(n squared). For a fixed x, the best partner differs from x in the highest possible bit, because a high bit outweighs all the lower ones. So I put every number in a binary trie, reading bits from 30 down to 0. To query x, I walk the trie and take the opposite bit whenever that child exists, which sets that bit of the XOR. I insert each number before querying it, so the trie is never empty. That's 31 steps per number, so O(n) time and O(31n) space."

## Follow-ups interviewers ask

- **"Can you do it without a trie?"** Yes, with prefix sets. Build the answer bit by bit from the top. At each bit, guess that it's 1, put every number's top bits into a hash set, and check whether any prefix `p` has `p ^ guess` in the set (the Two Sum idea, with XOR instead of minus). Also O(31 · n), and often faster in Python.
- **"Answer many queries: max XOR of x with any number in the array?"** Build the trie once and run the query walk for each x: O(31) per query.
- **"Max XOR of a subarray?"** XOR of a subarray is `prefix[j] ^ prefix[i]`, so insert prefix XORs into the trie and query each one: the same problem.
