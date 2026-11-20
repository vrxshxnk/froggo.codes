---
module: binary-search
title: Binary Search
readTime: 10
summary: Binary search throws away half of the possibilities with every check, so a billion candidates take about 30 steps. Learn one loop, one invariant and one question (what is my yes/no test?), and the off-by-one bugs that haunt this topic go away.
---

## Why this stage matters

The slow idea this stage replaces is **checking every candidate one by one**. Looking for a number in a sorted array? Scan it: O(n). Looking for the slowest speed that still finishes a job? Try speed 1, then 2, then 3, all the way up to 10⁹.

Binary search checks the **middle** candidate and uses the answer to throw away half of what's left. Halving 10⁹ candidates takes about 30 steps, because 2³⁰ ≈ 10⁹. That's the difference between "Time Limit Exceeded" and finishing in a millisecond.

Almost every student already knows the idea. What goes wrong is the **boundaries**: `<` or `<=`? `hi = mid` or `hi = mid - 1`? Return `lo` or `hi`? People memorise three or four versions of the loop and mix them up under pressure. This primer gives you **one loop**, explains exactly why each line is what it is, and every solution in this stage uses it unchanged.

## The core idea

Picture a long corridor of doors. Every door up to some point is locked, and every door after that point is open. You want the **first open door**. Walking from the start works, but it's slow.

So go to the middle door and try it.

- **It's open.** The first open door is this one or somewhere to its left. Everything to the right is irrelevant.
- **It's locked.** This door and every door to its left are locked. The first open door is strictly to the right.

Either way, half the corridor is gone after one try.

Here's the precise version, and it's the most important sentence in this stage: **binary search doesn't really need a sorted array. It needs a yes/no question `ok(i)` whose answers look like `F F F F T T T`**, all falses and then all trues. A question like that is called **monotonic**: once it turns true, it stays true. Binary search finds the first `T`.

A sorted array gives you such a question for free. In `nums = [1, 3, 3, 5, 8]`, the question "is `nums[i] >= 3`?" gives `F T T T T`. The question "is `nums[i] > 3`?" gives `F F F T T`.

## The one template

```python
def first_true(lo, hi, ok):
    # ok(i) looks like F F F T T T on [lo, hi], and hi is known to be T
    # (or is a "past the end" slot that counts as T).
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if ok(mid):
            hi = mid        # mid might be the first T, so keep it
        else:
            lo = mid + 1    # mid is F, and so is everything left of it
    return lo               # lo == hi: the first T
```

Use it for every problem in this stage. In the solutions we write it inline instead of passing a function, but the five lines inside are always the same.

### The loop invariant

An **invariant** is a sentence that is true before the loop, stays true after every step, and is still true when the loop ends. For this template it is:

> **The first true index is always inside `[lo, hi]`.**

Check that each line keeps it true:

- **At the start**, you choose `lo` and `hi` so the answer can't be outside. For array searches that means `lo = 0` and `hi = n`. Index `n` doesn't exist; treat it as an imaginary slot that counts as true. If the search returns `n`, nothing in the array was true.
- **If `ok(mid)` is true**, the first true is `mid` or to its left. Setting `hi = mid` keeps it inside. Setting `hi = mid - 1` would throw away `mid`, which might *be* the answer. That's the classic bug.
- **If `ok(mid)` is false**, `mid` and everything left of it are false, so `lo = mid + 1` loses nothing.
- **When `lo == hi`**, the range holds exactly one index, and the invariant says the answer is in the range. So it's `lo`.

Two more details:

- **Why `lo < hi` and not `lo <= hi`?** When `lo == hi` you already have the answer. With `<=`, the loop runs again, `ok(mid)` is true, `hi = mid` changes nothing, and it never ends.
- **Why `mid = lo + (hi - lo) // 2`?** It rounds down, so `mid` is always strictly less than `hi`. That means `hi = mid` always shrinks the range (no infinite loop), and `mid` never touches index `n` (no out-of-bounds read). Writing `lo + (hi - lo) / 2` instead of `(lo + hi) / 2` matters in C++ and Java: when `lo + hi` passes 2³¹ − 1 (about 2.1 × 10⁹), the sum overflows.

A trace on `nums = [1, 3, 3, 5, 8]` with `ok(i) = nums[i] >= 3`:

| lo | hi | mid | nums[mid] | ok? | update |
|---|---|---|---|---|---|
| 0 | 5 | 2 | 3 | T | `hi = 2` |
| 0 | 2 | 1 | 3 | T | `hi = 1` |
| 0 | 1 | 0 | 1 | F | `lo = 1` |
| 1 | 1 | | | | stop: answer `1` |

## Lower bound and upper bound

These two searches have names, and you'll use them constantly.

- **Lower bound of x:** the first index with `nums[i] >= x`.
- **Upper bound of x:** the first index with `nums[i] > x`.

In `[1, 3, 3, 5, 8]`, the lower bound of 3 is index 1 and the upper bound is index 3. The only difference in code is `>=` versus `>`. Everything you need falls out of them:

| You want | Use |
|---|---|
| Is x in the array? | `lb < n and nums[lb] == x` |
| First position of x | `lb` (if x is present) |
| Last position of x | `ub - 1` (if x is present) |
| How many copies of x | `ub - lb` |
| How many elements are `<= x` | `ub` |
| How many elements are `< x` | `lb` |
| Where to insert x to keep it sorted | `lb` |

Libraries have these built in: Python's `bisect_left` and `bisect_right`, and C++'s `lower_bound` and `upper_bound`. Java's `Arrays.binarySearch` returns *some* matching index, not necessarily the first. JavaScript has nothing built in. Our solutions write the loop by hand so you can adapt it when the question isn't a plain array lookup, which is exactly what interviewers ask for.

## Binary search on the answer

Here's where the stage gets powerful. Sometimes there's no array to search at all. *Koko Eating Bananas* asks for the **minimum speed** at which Koko finishes all her bananas within `h` hours.

Speeds are the candidates: 1, 2, 3, … up to the largest pile. Ask the yes/no question `ok(k)` = "at speed `k`, does she finish within `h` hours?" Eating faster never hurts, so if speed `k` works, `k + 1` works too. The answers look like `F F F T T T`. That's monotonic, so the first `T` is the minimum speed, and the template finds it unchanged with `lo = 1` and `hi = max(piles)`.

The recipe:

1. **Range.** What's the smallest possible answer (`lo`)? What's an answer you *know* works (`hi`)?
2. **Predicate.** Write `ok(x)`: "does answer `x` work?" This is usually a simple O(n) greedy check.
3. **Monotonic?** Convince yourself that if `x` works, every bigger `x` works too. If that fails, binary search is the wrong tool.
4. **Search.** Run the template. The total cost is O(n · log(range)).

If a problem asks for the **largest** `x` that works (answers like `T T T F F`), flip the question: search for the first `x` that *doesn't* work, and the answer is one less.

Rotated sorted arrays use the same trick. They aren't sorted, but "is `nums[i] <= nums[last]`?" is still `F F T T T`, which is all binary search needs.

## How to recognise this pattern

- The input is **sorted**, or sorted and then rotated.
- "Find the **first / last** position", "how many are **≤ x**", "where would x be **inserted**".
- "Find the **minimum** speed / capacity / days / time **such that** something is possible", or the maximum.
- Values go up to 10⁹ but checking one candidate is fast.
- The problem says **O(log n)** out loud.
- A matrix whose rows are sorted and continue one after another.

## The mistakes everyone makes

1. **Mixing templates.** Using `while lo <= hi` with `hi = mid`, or `while lo < hi` with `hi = mid - 1`. Pick this one loop and never change its shape. Only `lo`, `hi` and the condition change.
2. **`hi = mid - 1` when `ok(mid)` is true.** `mid` might be the answer. Keep it.
3. **Trusting the result without checking it.** A lower bound tells you where `x` *would* go. It could be `n`, or a slot holding a different value. Check `lo < n and nums[lo] == x`.
4. **Overflow.** `(lo + hi) / 2` overflows near 2³¹. So do predicates that add things up: Koko's total hours can reach 10¹³. Use 64-bit integers.
5. **A `hi` that isn't known to be true.** If `hi` might be false and the loop ends there, you return a wrong answer. Use a value that surely works, or the past-the-end slot and then check.
6. **A predicate that isn't monotonic.** If the answers look like `F T F T`, halving throws away real answers. Prove the shape before you code.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Binary Search | The template and the "is it really there?" check |
| Search a 2D Matrix | Treat a grid as one sorted list: index → (row, column) |
| Interesting Drink (Codeforces) | Sort once, then upper bound answers each query |
| Koko Eating Bananas | Binary search on the answer with a monotonic predicate |
| Find Minimum in Rotated Sorted Array | A predicate that works even when the array isn't sorted |
| Search in Rotated Sorted Array | Find the rotation point, then search the correct half |
| Find First and Last Position of Element in Sorted Array | Lower bound and upper bound together |

Try each problem for its time box before opening the walkthrough. When a search goes wrong, don't change `+1`s at random. Ask what `ok(i)` is, whether it really looks like `F F F T T T`, and whether `hi` starts on a true.
