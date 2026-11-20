---
id: lc-412
title: Fizz Buzz
pattern: Loop with ordered conditions
timeBox: 15
summary: For every number from 1 to n, write "Fizz", "Buzz", "FizzBuzz" or the number itself, depending on what it divides by.
hints:
  - "How do you test whether a number divides by 3? Look at the remainder operator, %. If i % 3 is 0, there's nothing left over."
  - "Some numbers divide by both 3 and 5, like 15. Which check has to happen first so 15 doesn't stop at plain \"Fizz\"?"
  - "Loop i from 1 to n. Check \"divisible by 15\" first, then 3, then 5, and otherwise write the number as a string. Add each result to a list."
insight: The order of your if-checks matters. Test the most specific case (divisible by both 3 and 5) before the general ones, or it never gets a chance to run.
time: O(n)
space: O(1) extra
related: [cf-4a, lc-9, lc-1672]
---

## The problem in plain English

You get one number `n`. Build a list of `n` strings, one for each number `i` from **1** to `n` (not from 0):

- if `i` divides by both 3 and 5, write `"FizzBuzz"`;
- else if `i` divides by 3, write `"Fizz"`;
- else if `i` divides by 5, write `"Buzz"`;
- otherwise write the number itself, as text: `"7"`, not `7`.

`n` is between 1 and 10⁴.

Example: `n = 5` → `["1", "2", "Fizz", "4", "Buzz"]`.

## Building the intuition

Two small ideas do all the work.

**"Divides by" means "remainder is zero."** The `%` operator gives the remainder: `9 % 3` is `0`, so 9 divides by 3. `10 % 3` is `1`, so 10 doesn't.

**Order matters.** Try writing the checks the way the rules read naturally: "if divisible by 3, Fizz; else if divisible by 5, Buzz; else if divisible by both, FizzBuzz". Now run 15 through it. `15 % 3 == 0`, so it prints `"Fizz"` and stops. The "both" check never runs.

The fix is to put the **most specific rule first**. A number divisible by both 3 and 5 is divisible by 15, so check `i % 15 == 0` before anything else.

## The optimal approach

1. Make an empty list `answer`.
2. For `i` from 1 to `n` (inclusive):
   - if `i % 15 == 0`, add `"FizzBuzz"`;
   - else if `i % 3 == 0`, add `"Fizz"`;
   - else if `i % 5 == 0`, add `"Buzz"`;
   - else add `i` converted to a string.
3. Return `answer`.

The subtle detail is the loop range. Python's `range(1, n + 1)` and C-style `i <= n` both include `n`. Writing `range(n)` gives you 0 to n − 1, which is off by one at both ends.

{{code}}

## Complexity

- **Time: O(n).** One pass, and each step is a few remainder checks.
- **Space: O(1) extra.** Apart from the list we must return, we only keep `i`.

## Edge cases and traps

- **Checking 3 before 15.** The classic bug: 15, 30 and 45 come out as `"Fizz"`.
- **Starting at 0.** `0 % 3 == 0`, so you'd add a stray `"FizzBuzz"` at the front.
- **Returning numbers instead of strings.** The list holds text. Use `str(i)`, `to_string(i)`, `String.valueOf(i)` or `String(i)`.
- **`n = 1`.** The answer is just `["1"]`.

## Say it in the interview

> "I loop from 1 to n and use the remainder operator to test divisibility. The only trap is order: a number divisible by both 3 and 5 would match the 3-check first, so I test divisibility by 15 before 3 and 5. It's O(n) time and constant extra space beyond the output."

## Follow-ups interviewers ask

- **"Now add 'Bazz' for multiples of 7."** Checking every combination (15, 21, 35, 105) gets messy fast. Instead, build the string: start with `""`, append `"Fizz"` if `i % 3 == 0`, `"Buzz"` if `i % 5 == 0`, `"Bazz"` if `i % 7 == 0`, and use the number if it's still empty. Each new rule is one more line.
- **"Can you avoid the % operator?"** Keep two counters that count up to 3 and 5 and reset to 0. When a counter hits its limit, that rule fires.
