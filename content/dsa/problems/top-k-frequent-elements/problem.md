---
id: lc-347
title: Top K Frequent Elements
pattern: Counting + bucket sort
timeBox: 20
summary: Return the k values that appear most often in the array, in any order.
hints:
  - "Step one is obvious: count how many times each value appears. The real question is how to pick the top k counts quickly."
  - "Sorting the counts works in O(n log n). A min-heap of size k gets you O(n log k). Can you avoid comparisons entirely?"
  - "A count can never be bigger than n. Make n + 1 buckets where bucket[c] holds every value that appears exactly c times, then read buckets from the highest count down until you have k values."
insight: Frequencies are integers between 1 and n, so you can bucket values by their count and read the buckets from high to low — no sorting needed, O(n).
time: O(n)
space: O(n)
related: [lc-49, lc-215, lc-703]
---

## The problem in plain English

Given `nums` and a number `k`, return the `k` values that occur **most often**. The answer is guaranteed to be unique, and you can return it in any order.

`nums = [1, 1, 1, 2, 2, 3]`, `k = 2` → `[1, 2]` (1 appears 3 times, 2 appears twice)

## Start with brute force

1. Count each value with a hash map.
2. Sort the distinct values by count, largest first.
3. Take the first `k`.

That's **O(n log n)** because of the sort. It's a fine first answer — say it, then improve it.

## Building the intuition

There are three levels of answer here, and walking an interviewer through them is a great signal:

1. **Sort by count** — O(n log n).
2. **Min-heap of size k** — keep only the `k` best counts seen so far; anything smaller gets popped. O(n log k). Great when `k` is tiny compared to `n`.
3. **Bucket sort** — O(n). This is the key observation: a value can appear **at most n times**. So counts live in the small range `1…n`, and we can use the count itself as an array index instead of comparing counts.

Picture `n + 1` shelves labelled 0 to n. Put each value on the shelf matching its count. Then walk the shelves from the top down, collecting values until you have `k`.

## The optimal approach

1. Count frequencies: `count[value] = times it appears`.
2. Create `buckets`, a list of `n + 1` empty lists.
3. For each `(value, c)` in `count`, append `value` to `buckets[c]`.
4. Walk `c` from `n` down to `1`, adding values from `buckets[c]` to the answer until it has `k` values.

{{code}}

## Dry run

`nums = [1, 1, 1, 2, 2, 3]`, `k = 2`, so `n = 6`

**Counts:** `{1: 3, 2: 2, 3: 1}`

**Buckets** (empty ones omitted): `buckets[3] = [1]`, `buckets[2] = [2]`, `buckets[1] = [3]`

| c | bucket | answer after |
|---|---|---|
| 6, 5, 4 | empty | `[]` |
| 3 | [1] | `[1]` |
| 2 | [2] | `[1, 2]` → we have k = 2, stop |

## Complexity

- **Time: O(n).** Counting is O(n), filling buckets is O(number of distinct values) ≤ O(n), and the walk touches at most n + 1 buckets.
- **Space: O(n)** for the counts and buckets.

For comparison: sorting is O(n log n), and the heap is O(n log k) time with O(n + k) space.

## Edge cases and traps

- **k equals the number of distinct values.** You return all of them — the loop handles it.
- **All values equal.** One bucket at index n holds the single value.
- **Bucket size.** You need `n + 1` buckets (counts go up to n), not `n`. Off-by-one here crashes.
- **Stopping mid-bucket.** A bucket can hold several values; stop as soon as you've collected k.

## Say it in the interview

> "I count with a hash map first. Sorting by count would be O(n log n), and a size-k min-heap is O(n log k). But counts are bounded by n, so I can bucket sort: bucket i holds the values that appear exactly i times. Reading buckets from n down to 1 until I have k values gives O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"What if it's a never-ending stream?"** You can't bucket the whole stream; keep counts and a size-k min-heap.
- **"Top k frequent words, ties broken alphabetically?"** (LeetCode 692) Use a heap with a custom comparator.
- **"Which is better in practice, heap or buckets?"** Buckets for one-off batch input; the heap when k is small and memory for n buckets is a concern.
