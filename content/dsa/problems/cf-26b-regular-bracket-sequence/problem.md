---
id: cf-26b
title: Regular Bracket Sequence
pattern: Greedy matching with a counter
timeBox: 25
summary: Delete as few brackets as possible from a string of ( and ) so that what's left is balanced, and print the length that remains.
hints:
  - "Scan left to right. When you meet a `)`, when can you definitely keep it, and when must it go?"
  - "With only one bracket type, a stack of `(` is just a number: how many `(` are still waiting to be closed."
  - "Keep `open` = waiting `(` count. On `(`: open++. On `)`: if open > 0, pair them (open--, answer += 2); otherwise drop this `)`. Any `(` still waiting at the end are dropped too. Print the answer."
insight: A `)` can be kept exactly when some earlier `(` is still unpaired, and pairing it right away is never worse. With one bracket type the stack collapses into a counter, so one pass with O(1) memory gives the answer.
time: O(n)
space: O(1)
related: [lc-20, lc-22]
---

## The problem in plain English

You get one line: a non-empty string of `(` and `)`, up to 10⁶ characters long. A bracket sequence is **regular** if it's balanced: reading left to right, you never close more than you've opened, and by the end everything is closed.

You may **delete** any characters you like, without changing the order of the rest. Print the **maximum length** of a regular sequence you can end up with. (The empty string counts as regular, so the answer can be 0.)

This is a Codeforces problem, so you read from standard input and print to standard output.

Example: `(()))(` → `4`. Delete the third `)` and the final `(` to get `(())`.

## Start with brute force

Try every subset of characters to keep, check whether the result is regular, and remember the longest.

It's correct, but a string of length n has 2ⁿ subsets. Even n = 40 means about 10¹² subsets, and here n can be 10⁶. We need to decide about each character on the spot.

## Building the intuition

Walk through `(()))(` and think about each character as you meet it.

- An opener `(` is never a problem *yet*. It might get closed later. Keep it as "waiting".
- A closer `)` needs a waiting `(` to its left. If there is one, pair them: both can stay.
- If a `)` arrives and **nothing is waiting**, no deletion choice can save it. Every `(` before it is already paired with some earlier `)`. Unpairing one of them to free it would only swap which `)` you keep, not add a pair. So drop it.

At the end, any `(` still waiting never got closed. Drop those too.

In *Valid Parentheses* you needed a stack, because there were three bracket types and the top told you *which type* was waiting. Here there's only one type, so all the stack would ever tell you is *how many* are waiting. A stack of identical items is just a counter. That's the whole trick: the stack shrinks to one integer.

## The optimal approach

1. Read the string `s`. Set `open = 0` (waiting openers) and `matched = 0` (length kept).
2. For each character:
   - `(`: `open += 1`.
   - `)` with `open > 0`: pair it. `open -= 1`, `matched += 2`.
   - `)` with `open == 0`: drop it. Do nothing.
3. Print `matched`. The leftover `open` openers are never counted, which is the same as deleting them.

The subtle detail is **why greedy pairing is safe**. Pairing a `)` with a waiting `(` immediately can't hurt a later `)`. If a later `)` had wanted that same `(`, then this `)` and that one could simply swap partners. The number of pairs stays the same. So taking every pair as soon as it's available gives the maximum.

{{code}}

## Dry run

`s = "(()))("`

| i | char | `open` before | action | `open` after | `matched` |
|---|---|---|---|---|---|
| 0 | `(` | 0 | wait | 1 | 0 |
| 1 | `(` | 1 | wait | 2 | 0 |
| 2 | `)` | 2 | pair | 1 | 2 |
| 3 | `)` | 1 | pair | 0 | 4 |
| 4 | `)` | 0 | nothing waiting → drop | 0 | 4 |
| 5 | `(` | 0 | wait | 1 | 4 |

The last `(` is still waiting at the end, so it's dropped. Print **4**.

## Complexity

- **Time: O(n).** One pass over at most 10⁶ characters.
- **Space: O(1)** besides the input string. Two integers replace the whole stack.

## Edge cases and traps

- **Counting `(` and `)` and printing `2 · min(count)`.** That fails on `)(`: one of each, but nothing can pair, so the answer is 0. Order matters.
- **Forgetting the leftover openers.** If you compute `n − dropped closers`, you count unclosed `(` as kept. Only count pairs.
- **Slow input in Java or Python.** 10⁶ characters is fine with `BufferedReader.readLine()` or `sys.stdin.readline()`. Avoid reading one character at a time through `Scanner`.
- **Trailing newline or `\r`.** Strip the line before scanning, or only react to `(` and `)` as the loop above does.

## Say it in the interview

> "I scan left to right with a counter of unmatched opening brackets. An opener increases it. A closer can be kept only if some opener is waiting. Then I pair them, decrease the counter and add 2 to the answer. Otherwise the closer can never be matched, so I drop it. Openers left over at the end are dropped too. Greedy pairing is safe because swapping partners never changes the number of pairs. It's one pass, O(n) time and O(1) space, since with one bracket type the stack is just a count."

## Follow-ups interviewers ask

- **"Print the actual sequence, not just its length."** Use a real stack of *indices* of `(`. Pair on `)`, mark both indices as kept, and output the kept characters in order.
- **"What's the longest regular *substring* (contiguous)?"** That's a different problem. Keep a stack of indices, starting with a `-1` sentinel, and measure `i − stack.top` after each successful pop.
- **"How many insertions would make the whole string regular?"** It's the dropped closers plus the leftover openers: the same scan, just counting the other side.
