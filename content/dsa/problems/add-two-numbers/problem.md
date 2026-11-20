---
id: lc-2
title: Add Two Numbers
pattern: Digit-by-digit addition with carry
timeBox: 25
summary: Two numbers are stored as linked lists of digits, ones digit first; return their sum in the same format.
hints:
  - "The digits are stored backwards, ones digit first. That's the order you add numbers by hand: right to left. So the order is actually a gift."
  - "Converting the lists to integers fails: a list can have 100 digits, far past what a 64-bit integer holds. Add column by column instead, keeping a carry."
  - "Walk both lists together. Each step: total = carry + digit from l1 (or 0) + digit from l2 (or 0). Append total % 10 to the result and set carry = total / 10. Keep going while either list has digits or the carry is non-zero. A dummy head makes appending easy."
insight: "The lists are already in the order you'd add by hand. Walk both together, add the two digits plus the carry, write down `total % 10`, carry `total / 10`, and keep going until both lists and the carry are used up."
time: O(max(n, m))
space: O(1) extra
related: [lc-66, lc-21, lc-206]
---

## The problem in plain English

You get two linked lists, `l1` and `l2`. Each one is a non-negative whole number written as a list of digits, **ones digit first**. So `2 → 4 → 3` means 342. Return their sum as a new list in the same backwards format.

Each list has between 1 and 100 nodes, every node holds a digit from 0 to 9, and there are no leading zeros except for the number 0 itself.

Example: `l1 = 2 → 4 → 3` (342), `l2 = 5 → 6 → 4` (465). 342 + 465 = 807, so return `7 → 0 → 8`.

## Start with brute force

Turn each list into an integer, add them, and turn the sum back into a list.

It's correct for small inputs, but a list can be 100 digits long. A 64-bit integer holds about 19 digits. The number overflows long before that. Python's big integers would technically survive, but an interviewer will tell you that's missing the point: the question is about working with digits one at a time.

## Building the intuition

How did you add numbers in school?

```text
   3 4 2
 + 4 6 5
 -------
   8 0 7
```

You started at the **right**, with the ones column: 2 + 5 = 7, write 7. Then the tens: 4 + 6 = 10, write 0, carry 1. Then the hundreds: 3 + 4 + carry 1 = 8, write 8.

Now look at the input again: `2 → 4 → 3` and `5 → 6 → 4`. The lists start with the ones digit. **They're already in the order you add.** Walking both lists from the head is the same as moving through the columns from right to left. And the answer also wants ones-digit first, so you can write each answer digit as you go.

All you have to carry from one column to the next is the carry, and it's always 0 or 1, because the biggest a column can be is 9 + 9 + 1 = 19.

## The optimal approach

1. Create a `dummy` node and a `tail` pointer on it. Set `carry = 0`.
2. While `l1` has a node, **or** `l2` has a node, **or** `carry` isn't 0:
   1. `total = carry`.
   2. If `l1` exists, add `l1.val` and move `l1` forward. Same for `l2`.
   3. Append a new node with digit `total % 10`, and move `tail` to it.
   4. `carry = total / 10` (integer division).
3. Return `dummy.next`.

The subtle detail is the **`or carry` in the loop condition**. When both lists run out, a carry might still be waiting. `5 + 5 = 10`: after the only column you've written `0` and carry is 1. Without `or carry`, you'd return `0` instead of `0 → 1`. Putting it in the condition handles it with no extra code after the loop.

Treating a missing digit as 0 handles lists of different lengths the same way: `99 + 1` is just `99 + 01`.

{{code}}

## Dry run

`l1 = 9 → 9` (99), `l2 = 1` (1). The answer should be 100, written `0 → 0 → 1`.

| Column | `l1` digit | `l2` digit | carry in | total | write | carry out | Result so far |
|---|---|---|---|---|---|---|---|
| 1 (ones) | 9 | 1 | 0 | 10 | 0 | 1 | `0` |
| 2 (tens) | 9 | – (0) | 1 | 10 | 0 | 1 | `0 → 0` |
| 3 (hundreds) | – (0) | – (0) | 1 | 1 | 1 | 0 | `0 → 0 → 1` |

After column 2 both lists are empty, but the carry keeps the loop alive for column 3. Then everything is 0 and the loop stops. Return `0 → 0 → 1`, which reads as 100.

## Complexity

- **Time: O(max(n, m)).** One loop step per column, and there are at most `max(n, m) + 1` columns.
- **Space: O(1) extra.** Just `carry`, `tail` and `dummy`. The result list itself has `max(n, m) + 1` nodes at most, but that's the output, which interviewers don't count as extra.

## Edge cases and traps

- **A final carry.** `5 + 5` must give `0 → 1`. Keep `carry` in the loop condition.
- **Lists of different lengths.** Don't stop when the shorter list ends. Treat its missing digits as 0.
- **Converting to integers.** Overflows past about 19 digits in C++, Java and JavaScript. A 100-digit input breaks it.
- **Both numbers are 0.** `0 + 0` gives a single `0` node. The loop runs once because both lists have a node.
- **Integer division in JavaScript.** `total / 10` is `1.9`, not `1`. Use `Math.floor(total / 10)`.

## Say it in the interview

> "The digits are stored ones-first, which is exactly the order you add numbers by hand. So I'll walk both lists together, column by column. Each step I add the two digits, treating a missing digit as 0, plus the carry. I append `total % 10` to the result and carry `total / 10`. I loop while either list has digits or the carry is non-zero, so a final carry isn't lost. A dummy head keeps appending simple. It's O(max(n, m)) time and O(1) extra space besides the output."

## Follow-ups interviewers ask

- **"What if the digits were stored most-significant first?"** That's *Add Two Numbers II*. Either reverse both lists, add as here, and reverse the result, or push the digits onto two stacks and pop them so you still go right to left.
- **"Why not just convert to integers?"** Overflow. 100 digits won't fit in any fixed-size integer type, and this method works for any length.
- **"Can you reuse the input nodes instead of creating new ones?"** Yes: write each digit into the longer list's nodes and only create a node for a final carry. It saves memory but changes the inputs, which you should ask about first.
