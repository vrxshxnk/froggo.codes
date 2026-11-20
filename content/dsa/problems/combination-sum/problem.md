---
id: lc-39
title: Combination Sum
pattern: Backtracking with reuse
timeBox: 25
summary: Given distinct positive numbers and a target, list every combination of them (each number usable any number of times) that adds up to the target.
hints:
  - "This is Subsets with two changes: you only save a path when it sums to the target, and a number may be picked again."
  - "To allow reuse, recurse with the same index i instead of i + 1. To avoid listing [2, 3] and [3, 2] separately, still never go back to an index smaller than i."
  - "Track how much of the target is left. Sort the candidates first; then the moment a candidate is bigger than what's left, every candidate after it is too, so break out of the loop."
insight: It's Subsets with a running total. Passing i (not i + 1) into the recursion lets a number repeat, and never looking left of i keeps each combination in one non-decreasing order, so there are no duplicates.
time: O(n^(t/m))
space: O(t/m)
related: [lc-78, lc-46, lc-322]
---

## The problem in plain English

You get an array `candidates` of **distinct** positive integers and a positive integer `target`. Return every combination of candidates whose sum is exactly `target`. You may use the same number **as many times as you like**. Two combinations are the same if they contain the same numbers the same number of times, so `[2, 2, 3]` and `[3, 2, 2]` count once. Any order of the output is fine.

Limits that matter: up to 30 candidates, each between 2 and 40, and `target` is at most 40. The problem promises fewer than 150 answers.

Example: `candidates = [2, 3, 6, 7]`, `target = 7` → `[[2, 2, 3], [7]]`. Using `2 + 2 + 3 = 7` and `7 = 7`.

## Start with brute force

Generate every sequence of candidates, adding numbers until the sum reaches or passes the target, and keep the ones that hit it exactly. That finds every answer, but it finds each one many times: `[2, 2, 3]`, `[2, 3, 2]` and `[3, 2, 2]` are all generated. You'd need to sort each result and put it in a set to remove the copies.

That wastes most of the work. A combination of length `k` can show up as up to `k!` different sequences, so the tree is far bigger than the answer. The fix is to make duplicates impossible instead of cleaning them up afterwards.

## Building the intuition

Start from *Subsets*. There, after choosing `nums[i]`, you only looked at elements to the **right** of `i`. That rule is what made `[2, 1]` impossible once you had `[1, 2]`. Every subset was built in one order only: increasing index.

Use the same rule here: **every combination is built with indices that never go down.** `[2, 2, 3]` can only be built as 2, then 2, then 3. `[3, 2, 2]` would need a step from index 1 back to index 0, which is not allowed. Duplicates are gone.

Now the reuse. In Subsets the next call was `backtrack(i + 1)`, which means "strictly to the right". Here you may pick the same number again, so the next call is `backtrack(i)`: "this index or to the right". That one-character change is the whole difference.

Last, the stopping rule. Carry `remaining`, the part of the target still to fill. When it hits `0`, save the path. And because every candidate is at least 2, `remaining` shrinks every step, so the recursion always ends.

Here is part of the tree for `[2, 3, 6, 7]`, target 7 (each node shows the path and what's left):

```text
                     [] 7
          /        |       \        \
      [2] 5     [3] 4    [6] 1    [7] 0 ✓
      /    \       |
 [2,2] 3  [2,3] 2  [3,3] 1
    |
[2,2,3] 0 ✓
```

`[2,2,2]` is missing because `2 > 1` is rejected straight away, which brings us to pruning.

## The optimal approach

1. **Sort** `candidates`. This lets you stop a loop early.
2. Write `backtrack(start, remaining)`:
   - If `remaining == 0`, save a copy of `path` and return.
   - For each `i` from `start` to the end, with `c = candidates[i]`:
     - If `c > remaining`, **break**. The array is sorted, so every later candidate is too big as well.
     - **Choose** `c`, **explore** with `backtrack(i, remaining − c)`, **un-choose** `c`.
3. Call `backtrack(0, target)`.

**The subtle detail is `break` versus `continue`.** Without sorting you could only `continue`, which skips one too-big number but still checks the rest. Sorting turns that into a `break`, which cuts off the whole rest of the loop. On inputs with many large candidates, that removes most of the tree.

{{code}}

## Dry run

`candidates = [2, 3, 6, 7]` (already sorted), `target = 7`.

| Call | `path` before | i, c | What happens |
|---|---|---|---|
| `bt(0, 7)` | `[]` | 0, 2 | choose 2 → `bt(0, 5)` |
| `bt(0, 5)` | `[2]` | 0, 2 | choose 2 → `bt(0, 3)` |
| `bt(0, 3)` | `[2, 2]` | 0, 2 | choose 2 → `bt(0, 1)`: 2 > 1, break |
| `bt(0, 3)` | `[2, 2]` | 1, 3 | choose 3 → `bt(1, 0)`: **save `[2, 2, 3]`** |
| `bt(0, 3)` | `[2, 2]` | 2, 6 | 6 > 3, break |
| `bt(0, 5)` | `[2]` | 1, 3 | choose 3 → `bt(1, 2)`: 3 > 2, break |
| `bt(0, 5)` | `[2]` | 2, 6 | 6 > 5, break |
| `bt(0, 7)` | `[]` | 1, 3 | choose 3 → `bt(1, 4)`: tries 3 → `bt(1, 1)`, dead end |
| `bt(0, 7)` | `[]` | 2, 6 | choose 6 → `bt(2, 1)`: 6 > 1, break |
| `bt(0, 7)` | `[]` | 3, 7 | choose 7 → `bt(3, 0)`: **save `[7]`** |

Result: `[[2, 2, 3], [7]]`.

## Complexity

Let `t` be the target and `m` the smallest candidate.

- **Time: O(n^(t/m)), roughly.** A path can be at most `t/m` numbers long, because each pick removes at least `m`. At each level we try at most `n` candidates. That's a loose upper bound; sorting and `break` cut far more in practice. Copying a saved path adds O(t/m) per answer.
- **Space: O(t/m)** extra for the recursion depth and `path`, not counting the output.

## Edge cases and traps

- **Recursing with `i + 1`.** Then each number can be used only once, and `[2, 2, 3]` is lost.
- **Recursing with `0`.** Then you get `[2, 2, 3]`, `[2, 3, 2]` and `[3, 2, 2]`: duplicates.
- **`break` without sorting.** On unsorted input `[7, 2]` with target 4, `break` at 7 would skip the 2 and miss `[2, 2]`.
- **JavaScript's default `sort()`.** It compares as strings, so `[10, 9, 2]` sorts to `[10, 2, 9]`. Always pass `(a, b) => a - b`.
- **No answer.** `candidates = [2]`, `target = 1` returns `[]`. Nothing special is needed.

## Say it in the interview

> "It's Subsets with a running total. I backtrack with a start index and the amount still remaining. I save the path when the remaining amount hits zero. To allow reuse I recurse with the same index, not the next one. Because I never go back to an earlier index, every combination is built in non-decreasing order only once, so there are no duplicates. I sort first so I can break out of the loop as soon as a candidate is larger than what's left. The depth is at most target over the smallest candidate."

## Follow-ups interviewers ask

- **"What if each number can be used only once, and the input has duplicates?"** That's *Combination Sum II*. Recurse with `i + 1`, sort, and skip `candidates[i]` when `i > start` and it equals `candidates[i − 1]`.
- **"What if you only need the number of combinations?"** Use dynamic programming: `ways[s] += ways[s − c]`, looping over coins on the outside. That's the counting version of *Coin Change*, and it runs in O(n · t).
- **"Why not memoise the backtracking?"** You're listing every combination, so the output alone can be exponential. Memoising lists of lists saves little. DP only wins when you count instead of list.
