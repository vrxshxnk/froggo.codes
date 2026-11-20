---
id: lc-150
title: Evaluate Reverse Polish Notation
pattern: Operand stack evaluation
timeBox: 25
summary: Evaluate an arithmetic expression written in postfix order, where every operator comes after its two operands.
hints:
  - "In `[\"2\", \"1\", \"+\", \"3\", \"*\"]`, when you reach `+`, which two numbers does it apply to? Where were they in the list?"
  - "An operator always uses the two most recent values that haven't been used yet. That is last-in, first-out."
  - "Push numbers onto a stack. On an operator, pop twice: the first pop is the RIGHT operand, the second is the LEFT. Push the result back. The last value left is the answer. Division truncates toward zero."
insight: In postfix, an operator always acts on the two most recent unused values. A stack holds exactly those values, so you evaluate the whole expression in one left-to-right pass, with no parentheses and no precedence rules.
time: O(n)
space: O(n)
related: [lc-227, lc-20, lc-155]
---

## The problem in plain English

You get a list of strings `tokens`. Each token is either an integer (it may be negative, like `"-11"`) or one of the operators `+`, `-`, `*`, `/`. The list is an expression in **Reverse Polish Notation** (RPN, also called postfix): each operator comes *after* the two values it combines.

Return the value of the expression as an integer. Division **truncates toward zero**, so `7 / -2` is `-3`, not `-4`. The expression is always valid, there's no division by zero, and every intermediate value fits in a 32-bit integer. There are up to 10⁴ tokens.

Example: `["2", "1", "+", "3", "*"]` means `(2 + 1) * 3 = 9`.

## Start with brute force

Scan the list for the first operator that has two numbers directly before it. Replace those three tokens with the result. Repeat until one token is left.

`[2, 1, +, 3, *]` → `[3, 3, *]` → `[9]`.

It works, but every replacement rebuilds the list, which costs O(n), and there are about n/2 operators. For n = 10⁴ that's around 5 × 10⁷ token moves. Notice, though, that we always replace right where we are, at the *most recent* numbers. That's a hint.

## Building the intuition

Follow `["4", "13", "5", "/", "+"]` with your finger and say out loud what you're holding:

- `4`: hold it.
- `13`: hold it.
- `5`: hold it. You're holding `4, 13, 5`.
- `/`: it needs two values. Which ones? The **last two**: `13` and `5`. `13 / 5 = 2`. Now you're holding `4, 2`.
- `+`: again the last two: `4 + 2 = 6`.

Every operator grabs the two most recent values and replaces them with one value, which becomes the new "most recent". Grabbing from the end and putting back on the end is exactly a **stack**.

Why is this so much easier than normal (infix) math? In `4 + 13 / 5` you need precedence rules to know `/` happens first. In postfix the order is already baked into the token order, so there are no parentheses and no precedence. The stack does all the remembering.

## The optimal approach

1. Create an empty stack of integers.
2. For each token:
   - If it's a number, convert it and push it.
   - If it's an operator, pop `b` (the top), then pop `a`. Compute `a op b` and push the result.
3. When the tokens run out, the stack holds exactly one number: the answer.

Two subtle details:

- **Operand order.** The first pop is the *right* operand. For `["3", "4", "-"]` you pop `b = 4`, then `a = 3`, and compute `3 − 4 = −1`. Swapping them gives `+1`.
- **Truncation toward zero.** C++ and Java integer division already truncates. Python's `//` *floors*, so `-7 // 2` is `-4`. Use `int(a / b)` in Python and `Math.trunc(a / b)` in JavaScript.

Also, don't test "is it a number?" by looking at the first character: `"-11"` starts with `-`. Compare the whole token to the four operator strings instead.

{{code}}

## Dry run

`tokens = ["4", "13", "5", "/", "+"]`

| token | action | stack after (bottom → top) |
|---|---|---|
| `4` | push | `4` |
| `13` | push | `4 13` |
| `5` | push | `4 13 5` |
| `/` | b = 5, a = 13, push 13 / 5 = 2 | `4 2` |
| `+` | b = 2, a = 4, push 4 + 2 = 6 | `6` |

One value is left: the answer is **6**.

## Complexity

- **Time: O(n).** Each token is pushed at most once and popped at most once, and each operation is O(1).
- **Space: O(n).** In the worst case, about half the tokens are numbers waiting on the stack before the operators arrive.

## Edge cases and traps

- **Swapping operands.** It matters for `-` and `/`. First pop = right side.
- **Floor vs truncate.** Python `//` and JavaScript `Math.floor` give the wrong answer for negative results.
- **Negative numbers as tokens.** `"-11"` is a number, not an operator. Check `token in {"+", "-", "*", "/"}` on the whole string.
- **A single number.** `["18"]` has no operators. The answer is `18`.
- **Using `parseInt` on operators.** In JavaScript, `Number("+")` is `NaN`. Check for operators first.

## Say it in the interview

> "In postfix, every operator applies to the two most recent values that haven't been used yet, so I'll keep those values on a stack. Numbers get pushed. For an operator I pop twice. The first pop is the right operand, the second is the left. I compute and push the result back. At the end one value remains, and that's the answer. I'll be careful that division truncates toward zero, which matters in Python. It's O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"How would you convert a normal infix expression to RPN?"** The *shunting-yard* algorithm: output numbers directly, and keep a stack of operators that you pop to the output while the top has higher or equal precedence.
- **"What if the input could be invalid?"** Check that the stack has two values before every operator, and exactly one at the end. Otherwise report an error.
- **"Could you evaluate a normal expression like `3+2*2` directly?"** Yes, that's *Basic Calculator II*, the last problem in this stage.
