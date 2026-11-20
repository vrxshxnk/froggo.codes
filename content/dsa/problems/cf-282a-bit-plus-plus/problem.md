---
id: cf-282a
title: Bit++
pattern: Look at the character that decides
timeBox: 15
summary: Start x at 0, run a list of statements that each add or subtract 1, and print the final x.
hints:
  - "There are only four possible statements: ++X, X++, --X and X--. Write them one under another. What do the two adding ones have in common?"
  - "Whatever side X is on, the middle character is always part of the operator."
  - "Set x = 0. For each statement, look at its middle character (index 1): if it is '+', add 1, otherwise subtract 1. Print x."
insight: All four statements are three characters long, and the middle one is always '+' or '−' from the operator. One character tells you everything, so you never need to compare whole strings.
time: O(n)
space: O(1)
related: [cf-231a, cf-71a, lc-412]
---

## The problem in plain English

This is a **Codeforces** problem: read standard input, print to standard output.

A tiny programming language has one variable, `x`, which starts at **0**. A program is `n` statements (1 ≤ `n` ≤ 150), one per line. Each statement is one of:

- `++X` or `X++`: add 1 to `x`;
- `--X` or `X--`: subtract 1 from `x`.

Run the program and print the final value of `x`.

Example:

```text
2
X++
--X
```

`x` goes 0 → 1 → 0, so print `0`.

## Building the intuition

The obvious plan is to compare each statement with all four possibilities: "if it equals `++X` or `X++`, add 1; else subtract 1". That works, and it's fine.

But look closely at the four strings:

| Statement | Index 0 | Index 1 | Index 2 |
|---|---|---|---|
| `++X` | `+` | **`+`** | `X` |
| `X++` | `X` | **`+`** | `+` |
| `--X` | `-` | **`-`** | `X` |
| `X--` | `X` | **`-`** | `-` |

The **middle character is always part of the operator**, wherever the `X` sits. So `statement[1]` alone tells you whether to add or subtract.

This "find the one character that decides" habit is worth building early. It makes string problems shorter, and there are fewer chances to mistype a long comparison.

## The optimal approach

1. Read `n` and set `x = 0`.
2. Repeat `n` times: read a statement `s`. If `s[1] == '+'`, do `x += 1`; otherwise `x -= 1`.
3. Print `x`.

### Reading the input

The statements contain symbols, not numbers, so read them as **strings**:

```python
data = sys.stdin.read().split()   # ["2", "X++", "--X"]
n = int(data[0])
```

```cpp
string s;
cin >> s;                         // reads "X++" as one string
```

```java
String s = in.readLine().trim();  // in is a BufferedReader; one statement per line
```

```javascript
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean);
```

In C++ and Java, `s[1]` / `s.charAt(1)` is a **character**, so compare it with `'+'` in single quotes. In Python and JavaScript it's a one-letter string, so `"+"` works.

{{code}}

## Dry run

| Statement | s[1] | Action | x |
|---|---|---|---|
| (start) | | | 0 |
| `X++` | `+` | add 1 | 1 |
| `--X` | `-` | subtract 1 | 0 |

Print `0`.

## Complexity

- **Time: O(n).** One character check per statement.
- **Space: O(1).** Just `x` and the current statement.

## Edge cases and traps

- **Checking only `s[0]`.** For `X++`, `s[0]` is `X`, so you'd treat it as a subtraction.
- **Comparing strings with `==` in Java.** `s == "X++"` compares references, not text. Use `s.equals("X++")`. Checking `s.charAt(1)` dodges the issue.
- **A stray `\r` at the end of the line.** Windows line endings can leave `X++\r`. `trim()` and `split()` remove it.
- **Negative answers.** If every statement subtracts, `x` ends at `−n`. That's fine, `x` is a normal signed integer.

## Say it in the interview

> "There are only four statements, and in all of them the middle character belongs to the operator. So I start x at 0, and for each statement add 1 if the middle character is a plus and subtract 1 otherwise. That's one check per line, linear time and constant space."

## Follow-ups interviewers ask

- **"What if statements could be `X+=5` or `X-=3`?"** Now the middle trick breaks. Find the operator, then parse the number after it.
- **"What if there were several variables?"** Keep a hash map from variable name to value. You will meet hash maps in the Arrays & Hashing stage.
