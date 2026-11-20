---
module: basics
title: How to Solve a Coding Problem
readTime: 9
summary: Before patterns, learn the routine every problem shares. Read the statement and its limits, know whether you write a function or a full program, guess the speed you need from the constraints, and test your own edge cases before you submit.
---

## Why this stage matters

The problems in this stage are small on purpose. *Fizz Buzz* is a loop and three `if`s. *Watermelon* is one line of logic. Nobody is testing whether you can invent an algorithm yet.

What this stage *does* test is everything around the algorithm: reading the question carefully, getting input in and output out, noticing the one case that breaks your code, and knowing whether your idea is fast enough. Those habits decide most wrong submissions, even on hard problems. Build them here, while the logic is easy, and every later stage gets lighter.

If you already code every day, clear these quickly and move on to the Arrays & Hashing stage.

## Reading a problem statement

Read every problem like a contract. Before you write a line of code, you should be able to answer four questions.

1. **What exactly comes in?** Types and shapes: one integer, an array, a grid, a string of lowercase letters only?
2. **What exactly goes out?** A number, `true`/`false`, a list in a particular order, or the text `YES`/`NO`? Returning a value when the problem wants an index is a classic mistake.
3. **What are the limits?** The constraints section (`1 ≤ n ≤ 10⁵`, `−10⁹ ≤ nums[i] ≤ 10⁹`) is the most important part of the page. It tells you how big the input can be, whether numbers can be negative or zero, and whether a sum can overflow a 32-bit `int`.
4. **Do the examples agree with what I understood?** Work at least one example by hand. If your reading gives a different answer from the expected output, you misread something. Better to find out now than after twenty minutes of coding.

A good trick: rewrite the problem in one sentence, in your own words. Every walkthrough on this site starts with exactly that, under "The problem in plain English".

## Two formats: LeetCode and Codeforces

You'll meet two styles of problem on this roadmap, and they want different code.

| | LeetCode | Codeforces |
|---|---|---|
| What you write | One **function** inside a `Solution` class | A complete **program** |
| Where input comes from | The function's parameters | Standard input (the keyboard, or a file the judge pipes in) |
| How you answer | `return` the value | **Print** it, in exactly the format asked |
| Extra output | Ignored | Breaks the answer. No "Enter n:" prompts! |

### LeetCode: fill in the function

LeetCode already read the input for you. You just do the work and return:

```python
class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        answer = []
        # ... build the answer ...
        return answer
```

Don't `print` the answer, and don't read anything with `input()`. Keep the method name and signature exactly as given.

### Codeforces: read, solve, print

On Codeforces your program starts with nothing. You read the text yourself, turn it into numbers, and print the result. Input is **always text**, and converting it is your job. Here is a template that reads "a number `n`, then `n` numbers" in each language:

```python
import sys

data = sys.stdin.read().split()       # every token as a string
n = int(data[0])
nums = list(map(int, data[1:n + 1]))
print(sum(nums))
```

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);      // fast input and output
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> nums(n);
    for (auto& x : nums) cin >> x;
    cout << accumulate(nums.begin(), nums.end(), 0LL) << '\n';
}
```

```java
import java.io.*;
import java.util.*;

public class Main {                   // Codeforces expects a public class like Main
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        StringTokenizer st = new StringTokenizer(in.readLine());
        long total = 0;
        for (int i = 0; i < n; i++) total += Long.parseLong(st.nextToken());
        System.out.println(total);
    }
}
```

```javascript
// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const n = data[0];
let total = 0;
for (let i = 1; i <= n; i++) total += data[i];
console.log(total);
```

Two habits worth keeping. Read input in bulk: Python's `input()` and Java's `Scanner` are slow when there are 10⁵ numbers. And when you print many lines, collect them and print once at the end. The four Codeforces problems in this stage each show a different input shape: one number, a list of words, rows of numbers, and strings full of symbols.

## A first feel for Big-O

**Big-O** is a way of saying how the number of steps grows as the input grows. A loop over `n` items is O(n). A loop inside a loop is O(n²). You don't need the theory yet, just one rule of thumb:

> A typical judge does roughly **10⁸ simple steps per second**.

Plug the largest `n` from the constraints into your idea and see whether it fits.

| Largest n | Steps for O(n²) | Fast enough? | What usually fits |
|---|---|---|---|
| 100 | 10⁴ | Easily | Almost anything |
| 5,000 | 2.5 · 10⁷ | Yes | O(n²) |
| 10⁵ | 10¹⁰ | **No**, minutes not seconds | O(n) or O(n log n) |
| 10⁶ | 10¹² | **No** | O(n), sometimes O(n log n) |

So when you see `n ≤ 10⁵`, a double loop over all pairs is too slow, and the problem is hinting that a smarter idea exists. When you see `n ≤ 100` (like *Watermelon*), simple is fine. Reading constraints this way tells you how clever you need to be before you start.

## Test your own code

Passing the examples is the start, not the finish. Judges run hidden tests built to catch the usual mistakes. Before you submit, run your code on the cases below, and work out the expected answer **by hand**, not by trusting your program.

- **The smallest input.** `n = 1`, a single element, a one-letter word, `[0]`.
- **The boundary of every rule.** If the rule says "more than 10", test 10 and 11. *Watermelon* hides its trap at `w = 2`.
- **Zero and negatives,** if the constraints allow them. *Palindrome Number* gets `0` and `-121`.
- **The extremes.** The biggest value (`2³¹ − 1`) for overflow, and the biggest `n` for speed.
- **All the same.** All 9s in *Plus One*, all zeros in *Team*.

If a case fails, trace it line by line with a tiny table: one column per variable, one row per loop step. The walkthroughs call this a **dry run**, and it's the fastest debugger you have.

## The mistakes everyone makes

1. **Off-by-one loops.** `range(n)` is 0 to n − 1, `range(1, n + 1)` is 1 to n. Decide which you need.
2. **Wrong output format.** Extra words, `Yes` instead of `YES`, values on one line when they should be on separate lines.
3. **Forgetting to convert input.** `"8" % 2` isn't what you meant. Turn text into numbers first.
4. **Overflow.** A 32-bit `int` stops at about 2.1 · 10⁹. Sums, products and reversed numbers pass that easily. Use `long` / `long long`.
5. **Not resetting a variable.** A total that should start at 0 for every row, set once outside the loop instead.
6. **Coding before understanding.** If you can't work an example by hand, you aren't ready to code it.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Fizz Buzz | Loops, `%`, and why the order of `if`s matters |
| Richest Customer Wealth | A loop inside a loop: walking a 2-D grid |
| Palindrome Number | Taking a number apart with `% 10` and `/ 10`, and overflow |
| Plus One | Working right to left with a carry |
| Watermelon (Codeforces) | Your first stdin/stdout program, and hunting the edge case |
| Way Too Long Words (Codeforces) | Reading a count, then that many strings |
| Team (Codeforces) | Reading rows of numbers and counting the ones that pass |
| Bit++ (Codeforces) | Reading symbol strings and finding the one character that decides |

Give each problem its time box before opening the walkthrough. If you get stuck, take one hint at a time. The struggle is where the habit forms.
