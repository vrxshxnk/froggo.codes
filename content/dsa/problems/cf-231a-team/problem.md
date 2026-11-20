---
id: cf-231a
title: Team
pattern: Count the rows that pass a test
timeBox: 15
summary: Three friends each say 1 (sure) or 0 (not sure) for every problem; count the problems at least two of them are sure about.
hints:
  - "Each line is one problem with three 0s and 1s. What single number tells you how many friends are sure?"
  - "Because every value is 0 or 1, adding the three values counts the 1s."
  - "Keep a counter starting at 0. For each of the n lines, read three numbers, and if their sum is at least 2, add 1 to the counter. Print the counter at the end."
insight: When values are only 0 or 1, adding them counts how many are 1. So "at least two friends are sure" is simply "the three numbers sum to 2 or more".
time: O(n)
space: O(1)
related: [lc-1672, cf-282a, cf-71a]
---

## The problem in plain English

This is a **Codeforces** problem: read standard input, print to standard output.

The first line has `n` (1 ≤ `n` ≤ 1000), the number of problems in a contest. Each of the next `n` lines has three numbers, one per friend. Each number is `1` if that friend is sure how to solve the problem, and `0` if not.

The friends only write a solution when **at least two** of them are sure. Print how many problems they will solve.

Example:

```text
3
1 1 0
1 1 1
1 0 0
```

The first problem has two friends sure, the second has three, the third only one. The answer is `2`.

## Building the intuition

For each line you need to know: how many of the three numbers are 1?

You could write out the cases (`a == 1 and b == 1`, or `a == 1 and c == 1`, or …), but there's a neater trick. Every value is either 0 or 1, so **adding them up counts the 1s**. `1 + 1 + 0 = 2` friends sure. `1 + 0 + 0 = 1` friend sure.

So the test for one problem is `a + b + c >= 2`. Do that for every line, and count how many lines pass. It's the same "loop over rows, compute something per row" shape as *Richest Customer Wealth*, but now you count instead of taking the max.

## The optimal approach

1. Read `n` and set `solved = 0`.
2. Repeat `n` times: read `a`, `b`, `c`. If `a + b + c >= 2`, add 1 to `solved`.
3. Print `solved`.

### Reading the input

This time there are many numbers spread over many lines. Two ways to think about it:

- **Line by line:** read a line, then split it into three numbers.
- **Token by token:** ignore lines and read numbers one at a time. Newlines are just spaces.

Token by token is usually simpler:

```python
data = list(map(int, sys.stdin.read().split()))   # [3, 1, 1, 0, 1, 1, 1, 1, 0, 0]
n = data[0]
# problem i's three numbers are data[1 + 3*i], data[2 + 3*i], data[3 + 3*i]
```

```cpp
int n;
cin >> n;
int a, b, c;
cin >> a >> b >> c;                // cin doesn't care which line a number is on
```

```java
BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
int n = Integer.parseInt(in.readLine().trim());
StringTokenizer st = new StringTokenizer(in.readLine()); // splits one line on spaces
int a = Integer.parseInt(st.nextToken());
```

```javascript
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
```

{{code}}

## Dry run

| Line | a b c | Sum | ≥ 2? | solved |
|---|---|---|---|---|
| 1 | 1 1 0 | 2 | Yes | 1 |
| 2 | 1 1 1 | 3 | Yes | 2 |
| 3 | 1 0 0 | 1 | No | 2 |

Print `2`.

## Complexity

- **Time: O(n).** One check per problem, at most 1000.
- **Space: O(1).** We never store the lines; each one is checked and forgotten.

## Edge cases and traps

- **`> 2` instead of `>= 2`.** "At least two" includes exactly two. With `> 2` you only count problems all three are sure about.
- **Reading only the first line.** In Java, `readLine()` returns **one** line. Call it again for every problem.
- **Off-by-one in the token index.** In the token approach, the first number is `n`, so problem 0's numbers start at index 1.
- **All zeros or all ones.** The answer is `0` or `n`. Your loop handles both.

## Say it in the interview

> "Each value is 0 or 1, so the sum of a line is the number of friends who are sure. I loop over the n lines, add 1 to a counter when the sum is at least 2, and print the counter. Linear time, constant space."

## Follow-ups interviewers ask

- **"What if there were k friends and you needed a majority?"** Sum the k values and check `sum > k / 2`.
- **"What if the values were confidence scores, not 0/1?"** Summing no longer counts people. Count the values above a threshold instead.
