---
id: cf-4a
title: Watermelon
pattern: Parity check with one trap
timeBox: 15
summary: Decide whether a watermelon of weight w can be cut into two parts that both weigh a positive even number.
hints:
  - "Try small weights by hand: 2, 3, 4, 5, 6, 8. Which ones can you split into two even parts? Each part must weigh at least something."
  - "Two even numbers always add up to an even number. So an odd w is hopeless. But is every even w fine?"
  - "w = 2 only splits as 1 + 1, which is odd. Every even w of 4 or more works as 2 + (w − 2). So the answer is YES exactly when w is even and w > 2."
insight: Even + even is always even, so w must be even. The smallest split is 2 + 2, so w must also be at least 4. That rules out the trap w = 2.
time: O(1)
space: O(1)
related: [lc-412, lc-9, cf-282a]
---

## The problem in plain English

This is a **Codeforces** problem. There's no function to fill in. Your program reads the input itself and prints the answer.

The input is one integer `w` (1 ≤ `w` ≤ 100), the weight of a watermelon. Two friends want to cut it into two pieces so that **each piece weighs an even number**, and each piece must weigh more than 0. The pieces don't have to be equal. Print `YES` if it's possible, otherwise `NO`.

Example: `w = 8` → `YES`. You can cut it as 2 + 6 or 4 + 4.

## Start with brute force

Try every cut. The first piece weighs `a`, from 1 to `w − 1`, and the second weighs `w − a`. If both are even, print `YES`.

With `w ≤ 100` that's at most 99 checks, so this is perfectly fast. It's also a great way to *discover* the shortcut: run it in your head for small `w` and look at which ones say `YES`.

## Building the intuition

Fill in a small table:

| w | Possible cuts | Any both-even? |
|---|---|---|
| 2 | 1 + 1 | No |
| 3 | 1 + 2, 2 + 1 | No |
| 4 | 2 + 2 | **Yes** |
| 5 | 1 + 4, 2 + 3, … | No |
| 6 | 2 + 4 | **Yes** |

Two patterns jump out:

- **Odd weights never work.** Two even numbers always add up to an even number, so they can't make an odd `w`.
- **Even weights work, except 2.** For any even `w` of 4 or more, cut off 2. The rest, `w − 2`, is even and positive. But `w = 2` can only become 1 + 1.

So the whole problem is one condition: `w` is even **and** `w > 2`.

## The optimal approach

1. Read `w`.
2. If `w % 2 == 0` and `w > 2`, print `YES`. Otherwise print `NO`.

### Reading the input

The input is a single number on one line. Here is how each language reads it:

```python
w = int(sys.stdin.readline())   # readline gives the text "8\n"; int() turns it into 8
```

```cpp
int w;
cin >> w;                        // cin skips spaces and newlines for you
```

```java
BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
int w = Integer.parseInt(in.readLine().trim());  // trim() drops stray spaces
```

```javascript
const w = Number(require("fs").readFileSync(0, "utf8").trim());  // read everything, then convert
```

Input always arrives as **text**. Converting it to a number is your job.

{{code}}

## Complexity

- **Time: O(1).** One remainder and one comparison.
- **Space: O(1).**

## Edge cases and traps

- **`w = 2`.** The trap that catches most first submissions. It's even, but 1 + 1 isn't.
- **`w = 1`.** Odd, so `NO`.
- **Forgetting to convert the input.** In Python and JavaScript the input is a string. `"8" % 2` doesn't do what you want.
- **Printing the wrong text.** Print exactly `YES` or `NO`. Extra words like `Answer: YES` fail.

## Say it in the interview

> "Two even numbers always sum to an even number, so an odd weight can't work. Every even weight from 4 up works, by cutting off a piece of 2. The only even failure is 2 itself, because it splits only into 1 and 1. So I print YES exactly when w is even and greater than 2. That's constant time."

## Follow-ups interviewers ask

- **"What if it had to be split into k even parts?"** Each part is at least 2, so you need `w` even and `w ≥ 2k`.
- **"What if both parts had to be odd?"** Odd + odd is even, so `w` must be even and at least 1 + 1 = 2.
