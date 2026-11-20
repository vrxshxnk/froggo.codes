---
id: lc-22
title: Generate Parentheses
pattern: Backtracking with open/close counts
timeBox: 25
summary: Given n, list every string of n pairs of parentheses that is correctly balanced.
hints:
  - "Build the string one character at a time. At any moment you can only add `(` or `)`. When is each choice allowed?"
  - "Think about Valid Parentheses with one bracket type: a prefix is still fixable as long as you never close more than you've opened."
  - "Track `open` and `close` counts. Add `(` if `open < n`. Add `)` only if `close < open`. When the string has length 2n, record it. Undo each choice after you return (backtracking)."
insight: Two rules decide every character. You may open while you have openers left (open < n), and you may close only when something is open (close < open). Follow only legal choices and every finished string is automatically valid.
time: O(4^n / sqrt(n))
space: O(n)
related: [lc-20, lc-78, lc-46, lc-39]
---

## The problem in plain English

You get an integer `n` between 1 and 8. Return **all** strings made of exactly `n` opening `(` and `n` closing `)` brackets that are **well-formed**: reading left to right, you never close a bracket that wasn't opened, and everything opened is closed by the end. Any order of the list is fine.

Example: `n = 3` → `["((()))", "(()())", "(())()", "()(())", "()()()"]`.

## Start with brute force

Every candidate is a string of length `2n` where each position is `(` or `)`. Generate all `2^(2n)` of them, and keep the ones that pass a balance check (a counter that never goes negative and ends at 0).

It's correct, and for `n = 8` it's 65,536 strings, of which only 1,430 are valid. Over 97% of the work is thrown away. At `n = 15` it would be over a billion strings. The waste comes from building strings like `"))..."` that were dead from their very first character.

## Building the intuition

Instead of building whole strings and checking them at the end, check **while building**. Stop the moment a prefix can't possibly become valid.

So when is a prefix still fixable? Think about the counter from *Valid Parentheses* with one bracket type: `+1` for `(`, `−1` for `)`. A prefix is fine as long as the counter never dips below zero. In other words, **you never close more than you've opened**.

That gives two rules for the next character, using `open` and `close` as the counts so far:

- **Add `(`** if `open < n`. You still have opening brackets left to place.
- **Add `)`** if `close < open`. There's an unmatched `(` waiting to be closed.

If you only ever make legal moves, every string that reaches length `2n` is valid. No checking needed at the end, and no dead branches are ever explored.

This "try a choice, go deeper, then undo the choice" style is called **backtracking**. You'll use it all through the Backtracking & Graphs stage. Here's a gentle first taste.

## The optimal approach

1. Keep a `path` (the characters chosen so far), plus `open` and `close` counts.
2. Write a recursive `build(open, close)`:
   - If `path` has length `2n`, add it to the result and return.
   - If `open < n`: append `(`, call `build(open + 1, close)`, then remove the `(`.
   - If `close < open`: append `)`, call `build(open, close + 1)`, then remove the `)`.
3. Call `build(0, 0)` and return the result.

The subtle detail is the **undo step**. `path` is shared by every call. After exploring "put `(` here", you must remove it before trying "put `)` here", or the second branch would start from the wrong prefix. In Python and JavaScript we use a list and `pop`; in Java a `StringBuilder` and `deleteCharAt`; in C++ a `string` and `pop_back`.

{{code}}

## Dry run

`n = 2`. Each row is one call, in the order the recursion makes them.

| path | open | close | can add `(`? | can add `)`? |
|---|---|---|---|---|
| `""` | 0 | 0 | yes | no (nothing open) |
| `"("` | 1 | 0 | yes | yes |
| `"(("` | 2 | 0 | no (used all n) | yes |
| `"(()"` | 2 | 1 | no | yes |
| `"(())"` | 2 | 2 | length 4 → **record** | |
| back to `"("`, try `)` → `"()"` | 1 | 1 | yes | no (nothing open) |
| `"()("` | 2 | 1 | no | yes |
| `"()()"` | 2 | 2 | length 4 → **record** | |

Result: `["(())", "()()"]`. The tree never touched a string starting with `)`.

## Complexity

- **Time: O(4^n / √n).** The number of valid strings is the *n-th Catalan number*, which grows like `4^n / (n√n)`. Each one takes O(n) to build and copy, which gives `4^n / √n`. Because we never explore dead branches, the work is proportional to the output.
- **Space: O(n)** besides the output. The recursion goes at most `2n` levels deep, and `path` holds at most `2n` characters.

## Edge cases and traps

- **Checking `close < n` instead of `close < open`.** That allows `"())("`, which is invalid. The close rule compares against `open`.
- **Forgetting to undo.** If you append without removing, the second branch builds on a polluted prefix.
- **Building new strings on every call.** `build(path + "(")` also works, because each call gets its own copy. It's simpler but copies O(n) characters at every node. Fine for `n ≤ 8`. Just know why the append/undo version is leaner.
- **`n = 1`.** Only `"()"`. The rules handle it.

## Say it in the interview

> "I'll build the strings character by character and only make legal moves, which is backtracking. I can add an opening bracket while I've used fewer than n, and a closing bracket only while closes are fewer than opens, so I never close something that isn't open. When the string reaches length 2n it's guaranteed valid, so I record it. I undo each choice after recursing. The work is proportional to the number of answers, the Catalan number, so about 4^n over root n time, with O(n) extra space for the recursion."

## Follow-ups interviewers ask

- **"How many strings are there for a given n?"** The n-th Catalan number, `C(2n, n) / (n + 1)`: 1, 2, 5, 14, 42, … For `n = 8` it's 1,430.
- **"Can you do it without recursion?"** Yes. Use an explicit stack of `(path, open, close)` states, or build up by length with dynamic programming: every valid string is `"(" + A + ")" + B` for smaller valid strings A and B.
- **"What if there are three bracket types?"** Keep a stack of currently open types. A closer must match the top, just like in *Valid Parentheses*.
