---
id: cf-1520d
title: Same Differences
pattern: Rearrange the equation, then count with a hash map
timeBox: 25
summary: Count the pairs of positions i < j where a[j] − a[i] equals j − i.
hints:
  - "The condition mixes values and indices on both sides. Try moving everything about i to one side and everything about j to the other."
  - "a[j] − a[i] = j − i is the same as a[j] − j = a[i] − i. So each position has a single 'key': a[k] − k."
  - "Count pairs with equal keys: walk the array, and for each position add 'how many earlier positions had the same key' from a hash map. Use 64-bit integers — the answer can be about 2·10¹⁰."
insight: Rewrite a[j] − a[i] = j − i as a[j] − j = a[i] − i. Now it's "count pairs with the same key", which a hash map of key counts does in one pass.
time: O(n) per test case
space: O(n)
related: [lc-1, lc-560, lc-49]
---

## The problem in plain English

This is a **Codeforces** problem, so you read input and print output yourself (no function to fill in).

There are `t` test cases. Each gives an array `a` of length `n`. Count the pairs of indices `i < j` such that

```
a[j] − a[i] = j − i
```

Print one count per test case.

**Example:** `a = [3, 5, 1, 4, 6, 6]` → `1`. The only good pair is `i = 3, j = 5` (0-based): `a[5] − a[3] = 6 − 4 = 2` and `5 − 3 = 2`. The dry run below finds it without ever checking pairs.

## Start with brute force

Check every pair `i < j`: O(n²). With `n` up to 2·10⁵, that's about 2·10¹⁰ checks — far too slow for a 2-second limit.

## Building the intuition

The condition looks like it ties `i` and `j` together. Do some algebra and move all the `i` terms to one side and all the `j` terms to the other:

```
a[j] − a[i] = j − i
a[j] − j    = a[i] − i
```

Now each position has a single number that only depends on itself: **`key[k] = a[k] − k`**. A pair is good exactly when **both positions have the same key**.

So the question becomes: *how many pairs share a key?* That's a counting problem, and a hash map of "key → how many times seen so far" answers it in one pass, just like *Two Sum* and *Subarray Sum Equals K*.

> This "separate the variables" move is one of the most useful tricks in competitive programming. Whenever a condition involves `i` and `j`, try to rewrite it as `f(i) = g(j)`.

## The optimal approach

For each test case:

1. `count = {}` (key → how many earlier positions had it), `answer = 0`.
2. For each position `k`:
   - `key = a[k] − k`
   - `answer += count[key]` — every earlier position with this key pairs with `k`
   - `count[key] += 1`
3. Print `answer` (as a **64-bit** integer).

It doesn't matter whether you use 0- or 1-based indices, as long as you're consistent — shifting every key by 1 doesn't change which keys are equal.

{{code}}

## Dry run

`a = [3, 5, 1, 4, 6, 6]` (0-based indices)

| k | a[k] | key = a[k] − k | count before | add | answer |
|---|---|---|---|---|---|
| 0 | 3 | 3 | `{}` | 0 | 0 |
| 1 | 5 | 4 | `{3:1}` | 0 | 0 |
| 2 | 1 | −1 | `{3:1, 4:1}` | 0 | 0 |
| 3 | 4 | 1 | `{…, −1:1}` | 0 | 0 |
| 4 | 6 | 2 | `{…, 1:1}` | 0 | 0 |
| 5 | 6 | 1 | `{…, 1:1, 2:1}` | **1** | 1 |

The pair is `i = 3, j = 5`: `a[5] − a[3] = 6 − 4 = 2` and `5 − 3 = 2`. ✓ Answer: **1**.

## Complexity

- **Time: O(n)** per test case — one pass with O(1) average map operations. Because the sum of all `n` is bounded, the whole input is O(total n).
- **Space: O(n)** for the map.

## Edge cases and traps

- **Overflow.** If all keys are equal, the answer is `n(n−1)/2 ≈ 2·10¹⁰`, which doesn't fit in a 32-bit `int`. Use `long long` (C++) or `long` (Java).
- **Resetting between test cases.** Create a fresh map for every test case.
- **Slow input.** Read input in bulk (`sys.stdin`, `BufferedReader`, `ios::sync_with_stdio(false)`) — 2·10⁵ numbers is a lot for slow I/O.
- **Hash attacks in C++.** On Codeforces, `unordered_map` can be slowed down by crafted tests. Since keys here lie in a small range (`a[k] − k` is between −n and n), an array offset by `n` is the bullet-proof option.

## Say it in the interview

> "Checking all pairs is O(n²). I rewrite a[j] − a[i] = j − i as a[j] − j = a[i] − i, so every index has its own key and a good pair is just two indices with the same key. Walking once and adding the count of earlier equal keys gives O(n). The answer can reach about 2·10¹⁰, so I use 64-bit integers."

## Follow-ups interviewers ask

- **"What if the condition were a[j] + a[i] = j − i?"** Rearrange: `a[i] + i = j − a[j]`. Now you need pairs where one side's key matches the other's — count `a[i] + i` as you go and look up `j − a[j]`.
- **"Count pairs with a[j] − a[i] = k (a constant)?"** That's Two Sum-style counting with `a[j] − k` as the lookup.
