---
id: lc-155
title: Min Stack
pattern: Stack that remembers its minimum
timeBox: 25
summary: Build a stack that supports push, pop, top and "give me the smallest value", all in constant time.
hints:
  - "Keeping a single `min` variable works for push. What goes wrong the moment you pop the element that was the minimum?"
  - "A stack only ever changes at the top. So the minimum of everything below any given entry never changes while that entry is on the stack."
  - "Store a pair with every push: the value, and the minimum of the stack including this value. `getMin` reads the pair on top; `pop` throws the pair away and the one below already knows the old minimum."
insight: The stack only changes at the top, so "the minimum of me and everything below me" is fixed for each entry. Store it next to the value when you push, and getMin is just a look at the top.
time: O(1) per operation
space: O(n)
related: [lc-20, lc-146, lc-150]
---

## The problem in plain English

Design a class `MinStack` with four operations:

- `push(val)`: put `val` on top;
- `pop()`: remove the top element;
- `top()`: return the top element without removing it;
- `getMin()`: return the **smallest** element currently in the stack.

Every operation must run in **O(1)** time. `pop`, `top` and `getMin` are only called on a non-empty stack. Values can be anywhere in the 32-bit integer range, and there are up to 3 × 10⁴ calls.

Example: `push(-2)`, `push(0)`, `push(-3)`, `getMin()` → `-3`, `pop()`, `top()` → `0`, `getMin()` → `-2`.

## Start with brute force

Use a normal stack and, for `getMin`, scan every element and return the smallest.

It's correct, but `getMin` is O(n). With 3 × 10⁴ calls on a stack that holds up to 3 × 10⁴ items, that's up to about 9 × 10⁸ steps, and it breaks the O(1) rule anyway.

## Building the intuition

The first thing everyone tries is one extra variable `currentMin`. Push is easy: `currentMin = min(currentMin, val)`.

Now pop. Say the stack is `[5, 3, 7]` and `currentMin = 3`. You pop `7`: fine, the minimum is still `3`. You pop `3`: what's the new minimum? You'd have to scan `[5]` to find out. One variable has forgotten history you now need.

So what history do you need? Notice something special about stacks: **only the top ever changes.** While `3` sits on the stack, everything below it stays exactly as it was. That means the answer to "what's the minimum of me and everything below me?" is fixed the moment `3` is pushed, and stays true until `3` is popped.

So just write that answer down at push time, right next to the value:

| stack (bottom → top) | value | min at or below |
|---|---|---|
| 1st | 5 | 5 |
| 2nd | 3 | 3 |
| 3rd | 7 | 3 |

`getMin` reads the top row's second column. When you pop a row, the row below still has its own correct minimum written down. Nothing needs recomputing.

## The optimal approach

1. Keep one stack of pairs `(value, minSoFar)`.
2. `push(val)`: if the stack is empty, `minSoFar = val`; otherwise `minSoFar = min(val, top.minSoFar)`. Push the pair.
3. `pop()`: remove the top pair. That's it.
4. `top()`: return the top pair's `value`.
5. `getMin()`: return the top pair's `minSoFar`.

The subtle detail is **duplicates of the minimum**. A popular variation keeps two stacks and only pushes to the min-stack when `val < currentMin`. Push `0, 1, 0`, pop once, and `getMin` must still say `0`, but that version has already thrown its only `0` away. Use `<=` there, or use pairs as we do here, and the problem goes away.

{{code}}

## Dry run

`push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()`

| call | stack after (value, min) | returns |
|---|---|---|
| `push(-2)` | `(-2,-2)` | |
| `push(0)` | `(-2,-2) (0,-2)` | |
| `push(-3)` | `(-2,-2) (0,-2) (-3,-3)` | |
| `getMin()` | unchanged | `-3` |
| `pop()` | `(-2,-2) (0,-2)` | |
| `top()` | unchanged | `0` |
| `getMin()` | unchanged | `-2` |

After popping `-3`, the new top `(0, -2)` already knew that the minimum below it was `-2`.

## Complexity

- **Time: O(1) per operation.** Each call touches only the top of the stack.
- **Space: O(n).** We store two numbers per element instead of one. Still O(n).

## Edge cases and traps

- **Repeated minimums.** `push(0), push(1), push(0), pop()`: the minimum is still `0`. The two-stack version with a strict `<` fails this.
- **Extreme values.** `INT_MIN` and `INT_MAX` must work. Don't start `currentMin` at a sentinel like `INT_MAX` and then rely on it to mean "empty". Check emptiness explicitly.
- **Java `Integer` comparison.** With two `Deque<Integer>` stacks, `a.peek() == b.peek()` compares references and breaks for values outside −128..127. Use `.equals` or unbox. The pair version avoids comparing boxed values at all.
- **Mixing up `top` and `getMin`.** `top` is the last pushed value, not the smallest.

## Say it in the interview

> "A single min variable breaks when you pop the minimum, because you've lost what the minimum was before it. But a stack only changes at the top, so for each element the minimum of itself and everything below is fixed while it's on the stack. I'll store that next to each value as a pair when I push. Then getMin is just the top pair's second field, and pop needs no work, because the pair below already knows its own minimum. Every operation is O(1), and space is O(n)."

## Follow-ups interviewers ask

- **"Can you use less memory?"** Use a second stack that only grows when `val <= currentMin`, and pop it only when the popped value equals its top. Same worst case, much less memory in typical runs.
- **"Can you do it with O(1) extra space?"** Yes: store `val − min` as a difference, using 64-bit values to avoid overflow, and decode the previous minimum on pop. It's clever but fragile. Mention it, and write the pair version.
- **"Now build a Max Stack that can also pop the maximum."** That needs more than a stack: usually a doubly linked list plus a sorted map, at O(log n) per operation.
