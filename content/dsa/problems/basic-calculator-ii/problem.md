---
id: lc-227
title: Basic Calculator II
pattern: Stack of signed terms
timeBox: 25
summary: Evaluate a string like "3+2*2" containing non-negative integers, + - * / and spaces, respecting operator precedence.
hints:
  - "`*` and `/` bind tighter than `+` and `-`. So think of the expression as a sum of terms, like `3 + (2*2)`. What's a term, and when do you know it's finished?"
  - "A `+` or `-` starts a new term. A `*` or `/` changes the term you're already building. Keep the previous operator around, because you only act on a number once you've read all its digits."
  - "Read digits into `num`. When you hit an operator or the end of the string, look at the PREVIOUS operator: `+` pushes num, `-` pushes −num, `*` replaces the top with top·num, `/` replaces the top with top/num, truncated toward zero. Then remember the new operator. The answer is the sum of the stack."
insight: Precedence only means that * and / glue numbers into one term, and + and - separate terms. Push each new term with its sign, fold * and / into the top term right away, and the answer is the sum of the stack.
time: O(n)
space: O(n)
related: [lc-150, lc-20]
---

## The problem in plain English

You get a string `s` with non-negative integers, the operators `+ - * /`, and spaces. There are no parentheses and no unary minus. Evaluate it with normal precedence: `*` and `/` happen before `+` and `-`, and operators of the same level go left to right. Division **truncates toward zero**. You can't use a built-in `eval`.

The expression is always valid. `s` has up to 3 × 10⁵ characters, and every intermediate result fits in a 32-bit integer.

Example: `"3+2*2"` → `7`, because `2*2` happens first. `" 3/2 "` → `1`.

## Start with brute force

Do it the way you learned in school. Tokenize the string. Repeatedly find the leftmost `*` or `/`, compute it, and replace the three tokens with the result. When none are left, do the same for `+` and `-`.

It's correct, but every replacement shifts the rest of the token list, which costs O(n), and there can be about n/2 operators. With 3 × 10⁵ characters that's on the order of 10¹⁰ moves. We want a single left-to-right pass.

## Building the intuition

Look at `14 - 3/2 + 2*3*4` and put brackets around what precedence really means:

```text
14  -  (3/2)  +  (2*3*4)
```

The expression is just a **sum of terms**. `+` and `-` separate the terms. `*` and `/` live inside a term. So:

- When you meet `+ x`, a new term `+x` starts.
- When you meet `- x`, a new term `−x` starts. Store the sign with the term, and subtraction becomes adding a negative.
- When you meet `* x` or `/ x`, you're not starting anything. You're changing the **most recent term**.

"Change the most recent thing" means a stack again. Push each term as it starts, modify the top for `*` and `/`, and add everything up at the end.

One practical wrinkle: you read characters, not numbers. You only know `14` is complete when you reach the `-` after it. So when you finish a number, the operator to apply is the **previous** one, the one before the number. Keep it in a variable `op`, starting as `+` so the first number is simply pushed.

## The optimal approach

1. `stack = []`, `num = 0`, `op = '+'`.
2. For each index `i` with character `c`:
   - If `c` is a digit: `num = num · 10 + digit`.
   - If `c` is an operator **or** `i` is the last index, the number is complete. Apply `op`:
     - `+`: push `num`;
     - `-`: push `−num`;
     - `*`: replace the top with `top · num`;
     - `/`: replace the top with `top / num`, truncated toward zero.
   - Then set `op = c` and `num = 0`.
3. Return the sum of the stack.

Spaces are skipped automatically, since they're neither digits nor operators. The `i == last` check matters even when the last character is a space: it still flushes the final number.

The subtle detail is **truncation of negative terms**. Because `-3` is stored as a negative term, `14-3/2` computes `-3 / 2`. It must give `-1`, so the result is `14 − 1 = 13`. Python's `//` gives `-2` and the answer `12`. Use `int(a / b)` in Python and `Math.trunc` in JavaScript. C++ and Java already truncate.

{{code}}

## Dry run

`s = "14-3/2"`

| i | c | `num` after | event | `op` used | stack after | `op` after |
|---|---|---|---|---|---|---|
| 0 | `1` | 1 | digit | | `[]` | `+` |
| 1 | `4` | 14 | digit | | `[]` | `+` |
| 2 | `-` | 0 | number done | `+` → push 14 | `[14]` | `-` |
| 3 | `3` | 3 | digit | | `[14]` | `-` |
| 4 | `/` | 0 | number done | `-` → push −3 | `[14, -3]` | `/` |
| 5 | `2` | 2 → 0 | digit, and last index | `/` → top = trunc(−3 / 2) = −1 | `[14, -1]` | |

The sum of the stack is `14 + (−1) = 13`.

## Complexity

- **Time: O(n).** One pass over the characters, O(1) work each, then one pass to sum the stack.
- **Space: O(n).** An expression like `1+1+1+…` pushes one term per number.

## Edge cases and traps

- **Applying the new operator instead of the previous one.** When you read `-` after `14`, the `14` belongs to the `+` before it.
- **Forgetting the last number.** Without the `i == last` check, `"3+2"` returns 3.
- **Floor division on negative terms.** `"1-3/2"` must be `0`, not `-1`.
- **Multi-digit numbers.** Build them with `num · 10 + digit`. Don't push each digit.
- **Spaces everywhere.** `" 3+5 / 2 "` is `5`. Never treat a space as the end of a number.
- **Left-to-right for `*` and `/`.** `100/10/3` is `(100/10)/3 = 3`. Folding into the top term does this naturally.

## Say it in the interview

> "Precedence just means the expression is a sum of terms: plus and minus start a new term, times and divide modify the current one. I'll keep a stack of signed terms. I read digits into a number, and when I hit an operator or the end, I apply the previous operator. Plus pushes the number, minus pushes its negative, and times or divide replace the top. Division truncates toward zero, which I handle explicitly in Python. The answer is the sum of the stack. That's O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"Can you do it in O(1) space?"** Yes. You only ever touch the top term, so keep `lastTerm` and `result` in variables. On `+` or `-`, add `lastTerm` to `result` and start a new one. On `*` or `/`, update `lastTerm`. At the end, return `result + lastTerm`.
- **"What if there are parentheses?"** That's *Basic Calculator III*. On `(`, recurse (or push your state onto a stack), evaluate the inside, and treat the result as a number.
- **"How is this related to Evaluate Reverse Polish Notation?"** RPN has no precedence to resolve, so one operand stack is enough. Here the operator order is implicit, so you resolve `*` and `/` eagerly and save `+` and `-` for the end.
