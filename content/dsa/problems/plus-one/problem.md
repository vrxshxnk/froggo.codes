---
id: lc-66
title: Plus One
pattern: Carry from the right end
timeBox: 15
summary: A big number is stored one digit per array slot; add 1 to it and return the new digits.
hints:
  - "Do it the way you add 1 on paper. Which digit do you touch first?"
  - "Adding 1 to a digit below 9 is easy and you can stop right there. What happens to a 9?"
  - "Walk from the last digit to the first. If the digit is below 9, add 1 and return. If it's 9, set it to 0 and carry on left. If you fall off the front, every digit was 9: the answer is a 1 followed by all those zeros."
insight: Adding 1 only ripples left through a run of 9s. Each 9 becomes 0 and passes the carry on; the first digit below 9 absorbs it and you stop. Only an all-9s number grows by one digit.
time: O(n)
space: O(1) extra
related: [lc-9, lc-2, lc-1672]
---

## The problem in plain English

You get an array `digits` that spells out a non-negative number, most significant digit first: `[1, 2, 3]` means 123. Add 1 to the number and return its digits in the same format.

The array has 1 to 100 digits, each from 0 to 9, and there are no leading zeros (except the number 0 itself, `[0]`).

Examples: `[1, 2, 3]` → `[1, 2, 4]`. `[1, 9, 9]` → `[2, 0, 0]`. `[9, 9]` → `[1, 0, 0]`.

## Start with brute force

Glue the digits into one integer, add 1, and split it back. But the array can hold **100 digits**, and a 64-bit integer holds only 19. In C++, Java and JavaScript the number overflows. Python survives, but the interviewer wants the digit-by-digit version.

## Building the intuition

Add 1 on paper and watch what you actually do.

- `123 + 1`: the last digit goes from 3 to 4. Done. Nothing else changes.
- `129 + 1`: 9 + 1 = 10, so write 0 and **carry** 1 to the left. Then 2 + 1 = 3. Done: `130`.
- `199 + 1`: 9 → 0, carry. 9 → 0, carry. 1 → 2. Done: `200`.
- `999 + 1`: every digit becomes 0, and the carry falls off the front. You need a new leading 1: `1000`.

One rule covers it. From the right, a **9** becomes 0 and passes the carry left; any **other digit** takes the +1 and you're finished. Run out of digits while carrying? Put a 1 in front.

## The optimal approach

1. Walk `i` from the last index down to 0.
2. If `digits[i] < 9`: add 1 to it and return `digits`. The carry is absorbed.
3. Otherwise `digits[i]` is 9: set it to 0 and keep going left.
4. If the loop finishes, every digit was 9 and is now 0. Return a 1 followed by those zeros.

The subtle detail is **returning early**. Once a digit absorbs the carry, everything to its left stays the same. Forget the `return` and you keep adding 1 further left.

{{code}}

## Dry run

`digits = [1, 9, 9]`

| i | digits[i] | Action | digits after |
|---|---|---|---|
| 2 | 9 | set to 0, carry left | `[1, 9, 0]` |
| 1 | 9 | set to 0, carry left | `[1, 0, 0]` |
| 0 | 1 | below 9: add 1, **return** | `[2, 0, 0]` |

## Complexity

- **Time: O(n).** In the worst case (all 9s) we touch every digit once.
- **Space: O(1) extra.** We change the array in place. Only the all-9s case builds a new array of n + 1 digits, and that's the answer itself.

## Edge cases and traps

- **All 9s, like `[9]` or `[9, 9, 9]`.** The answer is one digit longer. Don't forget the leading 1.
- **`[0]`.** 0 is below 9, so it becomes `[1]`. No special case needed.
- **Walking left to right.** Addition starts at the **last** digit. Starting at index 0 changes the wrong digit.

## Say it in the interview

> "I add 1 like on paper, from the last digit. A digit below 9 goes up by one and I return. A 9 becomes 0 and carries left. If every digit was 9, I return a leading 1 followed by n zeros. O(n) time, O(1) extra space, and no overflow because I never build the full number."

## Follow-ups interviewers ask

- **"Add any number k, not just 1."** Keep a running `carry`, starting with `k`. At each digit from the right, `total = digits[i] + carry`, write `total % 10`, set `carry = total / 10`. When digits run out, prepend whatever carry is left.
- **"What if the number is a linked list?"** That's *Add Two Numbers*, in the Linked Lists stage. The digits come in reverse order there, which makes carrying easier.
