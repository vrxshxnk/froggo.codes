---
id: lc-20
title: Valid Parentheses
pattern: Stack for matching pairs
timeBox: 15
summary: Given a string of brackets, decide whether every opening bracket is closed by the right type in the right order.
hints:
  - "Try it on paper with `([{}])`. When you meet a closing bracket, which opening bracket does it have to match: the first one you saw, or the most recent one still open?"
  - "\"Most recent one still open\" is last-in, first-out. Which data structure hands you back the last thing you put in?"
  - "Push every opener onto a stack. On a closer, the top of the stack must be its partner: if the stack is empty or the top is the wrong type, the string is invalid; otherwise pop. At the end the stack must be empty."
insight: A closing bracket always has to match the most recently opened bracket that's still unclosed. "Most recent" means last-in, first-out, so a stack of open brackets checks the whole string in one pass.
time: O(n)
space: O(n)
related: [lc-22, cf-26b, lc-150]
---

## The problem in plain English

You get a string `s` made only of the six characters `( ) [ ] { }`. Return `true` if the brackets are **valid**, which means:

- every opening bracket is closed by a bracket of the **same type**;
- brackets close in the **right order**: an inner pair must close before the outer one;
- no closing bracket appears without an opener before it.

The string has between 1 and 10⁴ characters.

Examples: `"()[]{}"` → `true`. `"([])"` → `true`. `"(]"` → `false` (wrong type). `"([)]"` → `false`: the counts are fine, but `)` tries to close `(` while `[` is still open inside it.

## Start with brute force

Valid strings always contain at least one **adjacent** pair like `()`, `[]` or `{}`. Delete that pair and what's left is still valid. So: keep deleting adjacent pairs until none are left, and check whether the string became empty.

`"{[()]}"` → `"{[]}"` → `"{}"` → `""`. Valid.

It's correct, but each round scans the whole string and may remove only one pair. With n = 10⁴ that's up to 5,000 rounds of 10⁴ steps, about 5 × 10⁷ character operations. We can do it in one pass.

## Building the intuition

Read `"{[()]}"` left to right like a human would. You see `{`, then `[`, then `(`. Three brackets are now "waiting". Then `)` arrives. Which waiting bracket does it close?

Not the `{` you saw first. It closes `(`, the **last** one you opened. After that, `]` closes `[`, the new last one. Then `}` closes `{`.

So you always care about the most recent unclosed bracket, and once it's closed, the one before it becomes the most recent. That's exactly how a stack of plates works: you put plates on top and take them off the top. **Last in, first out.**

Now the failures become obvious:

- `"([)]"`: after `(` and `[`, the top is `[`. A `)` arrives, but the top isn't `(`. Invalid.
- `")"`: a closer arrives and the stack is empty. Nothing to close. Invalid.
- `"(("`: you reach the end with brackets still on the stack. They were never closed. Invalid.

Counting brackets can't catch `"([)]"`, because its counts are perfect. Only the order catches it, and the stack remembers the order.

## The optimal approach

1. Make a small map from each closer to its opener: `) → (`, `] → [`, `} → {`.
2. Walk the string. If the character is an opener, push it.
3. If it's a closer:
   - if the stack is empty, return `false` (nothing to close);
   - if the top isn't this closer's opener, return `false` (wrong type or wrong order);
   - otherwise pop: this pair is done.
4. After the loop, return `true` only if the stack is empty.

The subtle detail is step 4. `"(("` never fails inside the loop, because nothing ever mismatches. If you return `true` after the loop without checking the stack, you'll accept strings with unclosed openers.

{{code}}

## Dry run

`s = "{[()]}"`

| i | char | action | stack after |
|---|---|---|---|
| 0 | `{` | opener → push | `{` |
| 1 | `[` | opener → push | `{ [` |
| 2 | `(` | opener → push | `{ [ (` |
| 3 | `)` | top is `(` ✓ → pop | `{ [` |
| 4 | `]` | top is `[` ✓ → pop | `{` |
| 5 | `}` | top is `{` ✓ → pop | empty |

The loop ends with an empty stack, so the answer is `true`.

Now `s = "([)]"`: after pushing `(` and `[`, the closer `)` needs `(` but the top is `[`. We return `false` at i = 2.

## Complexity

- **Time: O(n).** One pass, and each push or pop is O(1).
- **Space: O(n).** A string of only openers, like `"(((("`, pushes every character.

## Edge cases and traps

- **Forgetting the final empty check.** `"(("` must return `false`.
- **Popping an empty stack.** `")"` or `"())"` crashes in most languages unless you check `isEmpty` first.
- **Counting instead of stacking.** Three counters pass `"([)]"`, which is invalid. Order matters, so you need the stack.
- **Java's `Character` comparison.** `stack.peek() != map.get(c)` compares two boxed objects by reference. Unbox one side into a `char` first, as the Java solution does.
- **Odd length.** An odd-length string can never be valid. It's a fine early exit, but the stack handles it anyway.

## Say it in the interview

> "A closing bracket always has to match the most recent bracket that's still open, which is last-in, first-out, so I'll use a stack. I push openers. On a closer, I check the stack isn't empty and that the top is the matching opener, then pop. If anything fails I return false right away. At the end the stack must be empty, otherwise some openers were never closed. That's one pass, O(n) time and O(n) space in the worst case."

## Follow-ups interviewers ask

- **"What if there's only one bracket type?"** You don't need a stack at all, just a counter: +1 for `(`, −1 for `)`, fail if it goes negative, and it must end at 0. *Regular Bracket Sequence* in this stage uses exactly that.
- **"Can you make it O(1) space for three types?"** Not in general. You have to remember the order of open types, and that takes up to n/2 slots.
- **"Return the minimum number of insertions to make it valid."** For one type: count unmatched `)` while scanning and add the leftover open count at the end.
