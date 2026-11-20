---
id: lc-1
title: Two Sum
pattern: Hash map lookup
timeBox: 15
summary: Given a list of numbers and a target, return the positions of the two numbers that add up to the target.
hints:
  - "For each number x, you already know exactly which partner you need: target − x. The question is just how fast you can check whether you've seen it."
  - "Checking 'have I seen this value before?' is an O(n) scan in a list, but O(1) in a hash map."
  - "Walk the array once. Before storing the current number, look up its partner in the map of numbers you've already passed. Store value → index, not the other way round."
insight: Every number tells you its partner (target − x). A hash map of "numbers seen so far → their index" answers "have I seen my partner?" in O(1), so one pass is enough.
time: O(n)
space: O(n)
related: [lc-167, lc-15, lc-560, cf-1520d]
---

## The problem in plain English

You get an array `nums` and a number `target`. Exactly two numbers in the array add up to `target`. Return their **indices** (positions), in any order. You can't use the same element twice, but two *different* positions can hold the same value.

Example: `nums = [2, 7, 11, 15]`, `target = 9` → `[0, 1]`, because `nums[0] + nums[1] = 2 + 7 = 9`.

## Start with brute force

Try every pair. For each `i`, check every `j > i` and see if `nums[i] + nums[j] == target`.

It's correct, and it's worth saying out loud in an interview, but with `n` numbers that's about `n²/2` pair checks. For `n = 10,000` that's 50 million checks. We can do far better.

## Building the intuition

Look at the brute force again. When you're standing on `nums[i] = 2` with `target = 9`, you're not really searching for *any* number. You're searching for one specific number: `9 − 2 = 7`.

So the real question for every element is: **"Have I already seen `target − x`?"**

A list answers that in O(n). A hash map answers it in O(1). That's the whole trick.

## The optimal approach

1. Create an empty hash map `seen` that stores **value → index**.
2. Walk the array with index `i` and value `x`.
3. Compute `need = target − x`.
4. If `need` is in `seen`, you're done: return `[seen[need], i]`.
5. Otherwise store `seen[x] = i` and keep going.

Why check *before* storing? So an element never pairs with itself. With `nums = [3, 3]`, `target = 6`: at `i = 0` the map is empty, so we store `3 → 0`. At `i = 1` we need `3`, find it at index 0, and return `[0, 1]`. Correct.

{{code}}

## Dry run

`nums = [2, 7, 11, 15]`, `target = 9`

| i | x | need = 9 − x | `seen` before the check | Found? |
|---|---|---|---|---|
| 0 | 2 | 7 | `{}` | No → store `2 → 0` |
| 1 | 7 | 2 | `{2: 0}` | **Yes** → return `[0, 1]` |

We stopped after two steps instead of checking every pair.

## Complexity

- **Time: O(n).** One pass, and each map lookup and insert is O(1) on average.
- **Space: O(n).** In the worst case (the pair is at the very end) the map holds almost every number.

This is the classic **time–space trade-off**: we spend O(n) memory to go from O(n²) to O(n) time.

## Edge cases and traps

- **Duplicates like `[3, 3]`, target `6`.** Works because we look up before inserting.
- **Negative numbers and zero.** `target − x` still works; nothing assumes positivity.
- **Returning values instead of indices.** Read the question: it asks for positions.
- **Sorting first.** Sorting destroys the original indices. The two-pointer version (see *Two Sum II*) only fits when the input is already sorted.

## Say it in the interview

> "Brute force checks every pair, which is O(n²). But for each number I know exactly which partner I need, `target − x`. If I keep a hash map from value to index for everything I've already passed, I can check for the partner in O(1). One pass, O(n) time and O(n) space. I check before inserting so an element can't pair with itself."

## Follow-ups interviewers ask

- **"What if the array is sorted?"** Use two pointers from both ends for O(1) extra space — you will meet this as *Two Sum II* in the Two Pointers stage.
- **"What if you need all pairs, not one?"** Keep counts in the map and watch out for double-counting.
- **"What if memory is very tight?"** Sort a copy of `(value, index)` pairs and use two pointers: O(n log n) time, but no hash map.
