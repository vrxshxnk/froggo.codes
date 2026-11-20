---
id: lc-215
title: Kth Largest Element in an Array
pattern: Size-k min-heap
timeBox: 25
summary: Return the k-th largest number in an unsorted array, counting duplicates.
hints:
  - "Sorting answers it in one line. The interviewer will ask you to beat O(n log n). How many of the n numbers do you actually need to keep in order?"
  - "If you hold the k largest numbers seen so far, the answer is the smallest of them. Which structure gives you the smallest of a changing group in O(1)?"
  - "Walk the array with a min-heap. Push each number; whenever the heap grows to k + 1, pop its smallest. After the walk, the top of the heap is the answer."
insight: The k-th largest is the smallest member of the top k. A min-heap capped at size k holds exactly the top k as you scan, so its top is the answer after one pass.
time: O(n log k)
space: O(k)
related: [lc-703, lc-347, lc-230]
---

## The problem in plain English

You get an unsorted array `nums` and a number `k`. Return the **k-th largest** element: if you sorted the array from biggest to smallest, the one at position `k` (counting from 1). Duplicates count separately, so in `[3, 3, 1]` the 2nd largest is `3`.

`1 ≤ k ≤ n ≤ 10⁵`, and values are between −10⁴ and 10⁴.

Example: `nums = [3, 2, 1, 5, 6, 4]`, `k = 2` → `5`. Sorted biggest-first it's `6, 5, 4, 3, 2, 1`, and position 2 is `5`.

## Start with brute force

Sort the array in descending order and return `nums[k − 1]`. That's O(n log n): for `n = 10⁵`, about 1.7 million comparisons, which is fast and accepted.

So why bother? Because this problem exists to see whether you can **avoid sorting**. Say the one-liner first, then say: "Sorting puts all n numbers in order, but I only care about the top k. Let me do less work."

## Building the intuition

Imagine reading the numbers one by one and keeping a shortlist of the `k` biggest so far, like a top-k leaderboard.

When a new number arrives, who is it competing with? Not the leader. It only has to beat **last place** on the shortlist. If it does, it joins and the old last place gets kicked off. If it doesn't, nothing changes.

So at every step you need one thing fast: "who is the smallest on my shortlist?" That is a **min-heap** of size `k`. Its top is the weakest of the strong.

At the end, the shortlist is exactly the `k` largest numbers, and its weakest member, the heap's top, is the k-th largest.

Notice the flip: to find a *large* number, you use a *min*-heap. A max-heap of all `n` numbers works too (pop `k` times), but it stores everything: O(n + k log n) time and O(n) space. The size-`k` min-heap stores only what can still matter.

This is exactly the same idea as *Kth Largest Element in a Stream*, just with all the numbers handed over at once.

## The optimal approach

1. Create an empty min-heap.
2. For each `x` in `nums`:
   - push `x`;
   - if the heap's size is now `k + 1`, pop the smallest.
3. Return the heap's top.

The subtle detail is **why popping the smallest is safe**. When the heap holds `k + 1` numbers, its smallest has at least `k` numbers at least as big as it. So it can be the k-th largest only if it ties with one of them, and then the tie stays in the heap. Throwing it away never loses the answer.

{{code}}

### Quickselect: average O(n)

There's a second classic answer, the one this problem's "Quickselect" tag refers to. Pick a random pivot and split the numbers into **bigger than**, **equal to** and **smaller than** the pivot. Then you know which group holds the k-th largest, and you keep only that group:

```python
import random

def find_kth_largest(nums, k):
    while True:
        pivot = random.choice(nums)
        bigger = [x for x in nums if x > pivot]
        equal_count = sum(1 for x in nums if x == pivot)
        if k <= len(bigger):
            nums = bigger                        # answer is among the bigger ones
        elif k <= len(bigger) + equal_count:
            return pivot                         # answer is the pivot itself
        else:
            k -= len(bigger) + equal_count       # skip past bigger and equal
            nums = [x for x in nums if x < pivot]
```

A random pivot cuts the work roughly in half each time, so the total is about `n + n/2 + n/4 + … ≈ 2n`: **O(n) on average**, but O(n²) if you're unlucky every time. The three-way split matters: with a two-way split, an array of many equal values makes every round almost useless. The heap version is easier to get right under pressure and has no bad case; mention quickselect as the follow-up.

## Dry run

`nums = [3, 2, 1, 5, 6, 4]`, `k = 2`

| x | Heap after push | Size 3? | Heap after |
|---|---|---|---|
| 3 | `{3}` | no | `{3}` |
| 2 | `{2, 3}` | no | `{2, 3}` |
| 1 | `{1, 2, 3}` | yes, pop 1 | `{2, 3}` |
| 5 | `{2, 3, 5}` | yes, pop 2 | `{3, 5}` |
| 6 | `{3, 5, 6}` | yes, pop 3 | `{5, 6}` |
| 4 | `{4, 5, 6}` | yes, pop 4 | `{5, 6}` |

The top is `5`. Correct.

## Complexity

- **Time: O(n log k).** Each of the `n` numbers costs one push and at most one pop on a heap of size at most `k + 1`. When `k` is small, that's nearly linear.
- **Space: O(k).** The heap never holds more than `k + 1` numbers.

## Edge cases and traps

- **Using a max-heap of size k.** Its top is the largest, and popping it throws away the best candidates. For "k-th largest", the capped heap must be a **min**-heap.
- **C++ and Python defaults are opposite.** Python `heapq` is a min-heap (what we want). C++ `priority_queue<int>` is a max-heap, so add `greater<int>`. Java's `PriorityQueue` is a min-heap by default.
- **Thinking "k-th largest" means k-th distinct.** `[3, 2, 3, 1, 2, 4, 5, 5, 6]`, `k = 4` → `4`, counting both 5s.
- **Off by one in the sort answer.** Ascending sort means the answer is `nums[n − k]`, not `nums[k]`.
- **Two-way quickselect on duplicates.** An array of 10⁵ copies of the same number can make it quadratic. Use the three-way split shown above.

## Say it in the interview

> "Sorting gives O(n log n), but I only need the top k, so I'll keep a min-heap of the k largest numbers seen so far. For each number I push it, and if the heap has k + 1 items I pop the smallest, because something with k bigger numbers above it can't be the answer. After one pass the heap holds exactly the top k, and its top is the k-th largest. That's O(n log k) time and O(k) space. If you want average linear time, I can do quickselect with a random pivot and a three-way partition."

## Follow-ups interviewers ask

- **"Can you do it in O(n)?"** Quickselect: O(n) on average. The median-of-medians pivot makes it O(n) worst case, but it's rarely expected in interviews.
- **"Values are between −10⁴ and 10⁴. Does that help?"** Yes: count every value in an array of size 20,001, then walk from the top down until you've passed `k` numbers. O(n + range), no comparisons.
- **"What if k is close to n?"** The k-th largest is the `(n − k + 1)`-th smallest, so use a max-heap of size `n − k + 1` instead. Keep the heap as small as you can.
