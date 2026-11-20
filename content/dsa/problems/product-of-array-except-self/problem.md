---
id: lc-238
title: Product of Array Except Self
pattern: Prefix and suffix products
timeBox: 25
summary: For every position, return the product of all the other numbers in the array — without using division.
hints:
  - "The answer at position i is (product of everything to the left of i) × (product of everything to the right of i)."
  - "You can compute 'product of everything to the left' for every i in one left-to-right pass, carrying a running product."
  - "Do a left pass that writes the left products into the answer array, then a right-to-left pass that multiplies in a running right product. That's O(n) time and O(1) extra space."
insight: Everything except nums[i] is exactly "all elements to the left" and "all elements to the right" — two running products, one from each side, multiplied together.
time: O(n)
space: O(1) extra
related: [lc-560, lc-42, lc-53]
---

## The problem in plain English

Return an array `answer` where `answer[i]` is the product of every element of `nums` **except** `nums[i]`. You must do it in O(n) time and **without the division operator**.

`nums = [1, 2, 3, 4]` → `[24, 12, 8, 6]` (for example, `answer[1] = 1 × 3 × 4 = 12`)

## Start with brute force

For each `i`, multiply every other element: O(n²).

The tempting shortcut is "multiply everything, then divide by `nums[i]`". It's banned here, and it also breaks on zeros — you can't divide by 0. This is why the problem is interesting.

## Building the intuition

Draw the array and cover up position `i` with your finger. What's left is two pieces: **the part to the left** and **the part to the right**.

```
nums:      1   2   3   4
                [i=2]
left of i: 1 × 2 = 2
right of i:          4
answer[2] = 2 × 4 = 8
```

So `answer[i] = prefix[i] × suffix[i]`, where:

- `prefix[i]` = product of `nums[0..i−1]` (1 when there's nothing to the left)
- `suffix[i]` = product of `nums[i+1..n−1]` (1 when there's nothing to the right)

Each of those can be built in one pass with a running product. We don't even need two extra arrays: write the prefix products straight into `answer`, then sweep from the right multiplying in a running suffix.

## The optimal approach

1. Make `answer` of length n.
2. **Left pass:** `running = 1`. For `i` from 0 to n−1: set `answer[i] = running`, then `running *= nums[i]`.
3. **Right pass:** `running = 1`. For `i` from n−1 down to 0: `answer[i] *= running`, then `running *= nums[i]`.
4. Return `answer`.

Notice the order inside each loop: **use the running product first, then include `nums[i]`**. That's what keeps `nums[i]` itself out of its own answer.

{{code}}

## Dry run

`nums = [1, 2, 3, 4]`

**Left pass** (answer[i] = product of everything left of i):

| i | running before | answer[i] | running after |
|---|---|---|---|
| 0 | 1 | 1 | 1 |
| 1 | 1 | 1 | 2 |
| 2 | 2 | 2 | 6 |
| 3 | 6 | 6 | 24 |

**Right pass** (multiply in everything right of i):

| i | running before | answer[i] | running after |
|---|---|---|---|
| 3 | 1 | 6 × 1 = **6** | 4 |
| 2 | 4 | 2 × 4 = **8** | 12 |
| 1 | 12 | 1 × 12 = **12** | 24 |
| 0 | 24 | 1 × 24 = **24** | 24 |

Result: `[24, 12, 8, 6]`.

## Complexity

- **Time: O(n).** Two passes.
- **Space: O(1) extra.** Only `running`; the output array doesn't count as extra space by the problem's rules.

## Edge cases and traps

- **One zero.** Every answer is 0 except at the zero's position. Prefix/suffix handles it automatically.
- **Two or more zeros.** Every answer is 0 — also handled automatically.
- **Negative numbers.** Signs just multiply through; nothing special.
- **Wrong loop order.** Multiplying `running *= nums[i]` *before* writing the answer includes `nums[i]` in its own product.

## Say it in the interview

> "Division is off the table and breaks on zeros anyway. The product of everything except i is the product of everything to its left times everything to its right. I do a left-to-right pass storing the left product in the answer array, then a right-to-left pass multiplying in a running right product. O(n) time, O(1) extra space."

## Follow-ups interviewers ask

- **"What if division were allowed?"** Total product divided by `nums[i]` — but count zeros: with one zero only that position is non-zero, with two or more everything is zero.
- **"What about overflow?"** The problem guarantees products fit in 32 bits; in general you'd use 64-bit integers or work modulo a prime.
- **"Can you explain prefix sums?"** Same idea with addition — the next problem, *Subarray Sum Equals K*, is built on it.
