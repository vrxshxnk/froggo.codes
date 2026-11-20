---
module: stacks-queues
title: Stacks & Queues
readTime: 8
summary: A stack remembers the most recent unfinished thing, and that is exactly what bracket matching, expression evaluation and "next greater element" problems need. Learn four stack shapes and this whole stage turns into one idea used four ways.
---

## Why this stage matters

Many problems have a brute force that keeps **looking back**: "which bracket does this `)` close?", "which two numbers does this `+` combine?", "which earlier days does today's heat answer?". Scanning back each time costs O(n) per step, so O(n²) overall.

The fix is to notice that the answer is almost always the **most recent unfinished thing**. If you keep the unfinished things on a stack, the one you need is always on top. Each element goes on once and comes off once, and the O(n²) scan becomes O(n).

## The core idea

Think of a stack of plates in a hostel mess. You put clean plates on top, and you take plates off the top. The plate you can reach is always the **last one put down**. That's **LIFO**: last in, first out.

A **queue** is the line at the mess counter: first come, first served, or **FIFO**. You'll use queues heavily in the Backtracking & Graphs stage for breadth-first search. This stage is about stacks, because problems where "most recent" matters are everywhere.

Precisely, a stack supports:

| Operation | What it does | Cost |
|---|---|---|
| `push(x)` | put x on top | O(1) |
| `pop()` | remove and return the top | O(1) |
| `peek()` / `top()` | look at the top without removing it | O(1) |
| `isEmpty()` | anything left? | O(1) |

| Language | Stack | Queue |
|---|---|---|
| Python | `list` (`append`, `pop`, `[-1]`) | `collections.deque` |
| C++ | `stack<T>` or `vector<T>` | `queue<T>` or `deque<T>` |
| Java | `ArrayDeque<T>` (`push`, `pop`, `peek`) | `ArrayDeque<T>` (`offer`, `poll`) |
| JavaScript | array (`push`, `pop`, `at(-1)`) | array with a head index |

In Java, prefer `ArrayDeque` to the old `Stack` class. In JavaScript, `shift()` on a big array is O(n), so a real queue keeps a moving head index instead.

## The templates

### 1. Matching: push openers, pop on closers

*Valid Parentheses*, *Regular Bracket Sequence*. Use it when something opened earlier must be closed later, and the latest opened thing closes first.

```python
pairs = {")": "(", "]": "[", "}": "{"}
stack = []
for c in s:
    if c in pairs:
        if not stack or stack[-1] != pairs[c]:
            return False
        stack.pop()
    else:
        stack.append(c)
return not stack           # leftover openers were never closed
```

With only **one** bracket type, every stack item is identical, so the stack is just a counter. That's the whole trick in *Regular Bracket Sequence*.

### 2. Evaluation: operands wait on a stack

*Evaluate Reverse Polish Notation*, *Basic Calculator II*. Use it when an operator acts on the most recent values.

```python
stack = []
for t in tokens:
    if t in ("+", "-", "*", "/"):
        b = stack.pop()     # first pop is the RIGHT operand
        a = stack.pop()
        stack.append(apply(a, t, b))
    else:
        stack.append(int(t))
return stack[-1]
```

For normal infix expressions without brackets, push **signed terms** instead. `+` and `-` start a new term, `*` and `/` modify the top term, and the answer is the sum.

### 3. Monotonic stack: pop while worse, then push

*Daily Temperatures*. Use it for "next greater / next smaller element" questions.

```python
answer = [0] * n
stack = []                                  # indices, values decreasing bottom -> top
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] < x:    # x answers everyone smaller on top
        j = stack.pop()
        answer[j] = i - j
    stack.append(i)
```

A **monotonic stack** is one whose values stay sorted from bottom to top. It works because once a bigger element arrives, the smaller ones behind it can never be anyone's answer again, so you pop them. Each index is pushed once and popped at most once, so the nested loop is still O(n). This kind of argument is called **amortized** analysis: count the total work, not the loop nesting.

### 4. A stack that remembers: store extra info per entry

*Min Stack*. A stack only changes at the top, so anything you compute about "this entry and everything below it" stays true until that entry is popped. Store it next to the value.

```python
stack.append((val, min(val, stack[-1][1]) if stack else val))
```

*Generate Parentheses* is the odd one out. It's really backtracking, the topic of the Backtracking & Graphs stage, but its rule (you may close only while `close < open`) is the same balance idea as template 1.

## How to recognise this pattern

Reach for a stack when you see:

- **brackets, tags or nesting**: "valid", "balanced", "well-formed";
- **expressions**: "evaluate", "calculator", postfix or RPN;
- **"next greater"**, "next warmer", "next smaller", "how many days until", "span";
- **"undo"**, "backspace", or "most recent";
- a brute force whose inner loop **walks backwards** looking for the nearest something;
- a design question asking for O(1) extras (min, max) on top of push and pop.

## The mistakes everyone makes

1. **Popping an empty stack.** Check `isEmpty` before every `pop` or `peek` on a closer.
2. **Forgetting the end check.** A matching problem must also confirm the stack is empty at the end.
3. **Swapping operands.** In RPN the first pop is the right operand, which matters for `-` and `/`.
4. **Floor instead of truncate.** Python's `//` and JavaScript's `Math.floor` round negatives down. Interview problems want truncation toward zero: `int(a / b)` or `Math.trunc`.
5. **Storing values when you need indices.** For distances like `i − j`, push indices and look values up.
6. **`<` vs `<=` in a monotonic stack.** "Strictly greater" and "greater or equal" give different answers with duplicates. Decide on purpose.
7. **Comparing boxed values in Java.** `Integer` and `Character` objects compared with `==` compare references. Unbox first.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Valid Parentheses | Template 1: the most recent opener must close first |
| Min Stack | Template 4: store "min so far" next to each value |
| Evaluate Reverse Polish Notation | Template 2: operands wait for their operator |
| Generate Parentheses | The balance rule (`close < open`) as a first taste of backtracking |
| Daily Temperatures | Template 3: the monotonic stack and amortized O(n) |
| Regular Bracket Sequence (Codeforces) | One bracket type, so the stack collapses into a counter |
| Basic Calculator II | Template 2 with precedence: a stack of signed terms |

Give each problem its full time box before opening the walkthrough. If you get stuck, reveal one hint at a time. Writing the stack contents out by hand for a small example is often all it takes.
