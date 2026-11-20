---
id: lc-4
title: Median of Two Sorted Arrays
pattern: Binary search on a partition
timeBox: 40
summary: Given two sorted arrays, find the median of all their numbers together, in logarithmic time.
hints:
  - "You don't need the merged array. The median is defined by a cut: a left half and a right half of equal size, where everything on the left is no bigger than everything on the right."
  - "If you decide that i elements of the first array go to the left half, the number taken from the second array is forced: half − i. So the whole cut is controlled by one number, i."
  - "Binary search i over the shorter array. Compare the four numbers next to the two cuts. If the first array's left neighbour is bigger than the second array's right neighbour, you took too many from the first array. Move left. In the opposite case, move right."
insight: The median is a cut that splits all m + n numbers into two equal halves, with every left number no bigger than every right number. Choosing how many come from the shorter array fixes the whole cut, and that choice can be binary searched by checking just four numbers.
time: O(log(min(m, n)))
space: O(1)
related: [lc-704, lc-33, lc-295]
---

## The problem in plain English

You get two arrays, `nums1` (length `m`) and `nums2` (length `n`). Each one is sorted in non-decreasing order. Imagine pouring them together into one sorted list. Return the **median** of that list:

- if the total count is odd, the middle element;
- if it's even, the average of the two middle elements, as a decimal.

One array can be empty, but not both. The catch: the expected time is **O(log(m + n))**, so you can't merge.

Example: `nums1 = [1, 3]`, `nums2 = [2]`. Together that's `[1, 2, 3]`, so the median is `2.0`. With `nums1 = [1, 2]`, `nums2 = [3, 4]`, together `[1, 2, 3, 4]`, the median is `(2 + 3) / 2 = 2.5`.

## Start with brute force

Merge the two arrays with two pointers, the way you did in *Merge Two Sorted Lists*. Then read off the middle. That's O(m + n) time. You can even stop halfway and use O(1) space.

It's correct, and in most interviews it's the right thing to say first. But the problem asks for a logarithmic answer. With `m + n = 2,000` elements, a merge does about 1,000 steps and binary search does about 11. The interviewer wants to see the second one.

## Building the intuition

This Hard is really two Medium ideas stacked together: **"what does the median mean?"** and **"binary search on the answer"**.

**Idea 1: the median is a cut, not a number you have to find.** Take `nums1 = [1, 3, 7, 9]` and `nums2 = [2, 4]`. Merged, they'd be `[1, 2, 3, 4, 7, 9]`, and the median sits between the 3rd and 4th elements. Now forget the merge. Draw a vertical line through *each* original array, so three elements end up on the left in total:

```text
nums1:  1  3 | 7  9
nums2:  2    | 4
```

Now the left side `{1, 3, 2}` has three elements and the right side `{7, 9, 4}` has three. Every left number is no bigger than every right number. That's exactly the median split. The median is `(max of left + min of right) / 2 = (3 + 4) / 2 = 3.5`. Check: merged `[1, 2, 3, 4, 7, 9]` gives `(3 + 4) / 2`. Correct.

So the job is: **find two cuts, one in each array, that make a valid split.**

**Idea 2: one number decides everything.** The left half must hold `half = (m + n + 1) / 2` elements. (The `+ 1` gives the left side the extra element when the total is odd, so the median is then just the max of the left.) If you take `i` elements from `nums1`, you *must* take `j = half − i` from `nums2`. Pick `i`, and the whole cut is fixed.

**Idea 3: how do you check a cut?** Each array is already sorted, so inside one array the left part is automatically no bigger than the right part. You only need to check the two "cross" pairs:

- `nums1[i − 1] <= nums2[j]` (the last left element of the first array vs the first right element of the second);
- `nums2[j − 1] <= nums1[i]`.

That's four numbers. If both hold, you've found the median.

**Idea 4: which way to move?** If `nums1[i − 1] > nums2[j]`, the first array gave too many big numbers to the left. Make `i` smaller. If `nums2[j − 1] > nums1[i]`, the first array gave too few. Make `i` bigger. One test tells you which half of the range to throw away. **That's binary search.**

## The optimal approach

1. If `nums1` is longer, swap so `nums1` is the shorter one. Call the lengths `m ≤ n`.
2. Set `half = (m + n + 1) / 2`. Binary search `i` over `[0, m]`.
3. For each `i`, set `j = half − i`. Read the four neighbours `left1 = nums1[i − 1]`, `right1 = nums1[i]`, `left2 = nums2[j − 1]`, `right2 = nums2[j]`. A missing neighbour (the cut is at an edge) counts as −∞ on the left or +∞ on the right.
4. If `left1 <= right2` and `left2 <= right1`, you're done:
   - odd total: return `max(left1, left2)`;
   - even total: return `(max(left1, left2) + min(right1, right2)) / 2`.
5. If `left1 > right2`, set `hi = i − 1`. Otherwise set `lo = i + 1`.

**The subtle detail: why search the shorter array?** Two reasons. Speed: the range is `[0, m]`, so you get O(log(min(m, n))). Safety: with `m ≤ n`, `j = half − i` always lands in `[0, n]`. If you searched the longer array, `j` could go negative and you'd index out of bounds.

{{code}}

## Dry run

`nums1 = [1, 3, 8, 9, 15]` (m = 5), `nums2 = [7, 11, 18, 19, 21, 25]` (n = 6). Total 11, so `half = 6`. The median is the 6th smallest.

| lo | hi | i | j | left1 | right1 | left2 | right2 | Check | Action |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 5 | 2 | 4 | 3 | 8 | 19 | 21 | `19 > 8`: too few from nums1 | `lo = 3` |
| 3 | 5 | 4 | 2 | 9 | 15 | 11 | 18 | `9 <= 18` and `11 <= 15` ✓ | odd total → `max(9, 11) = 11` |

Merged, the list is `[1, 3, 7, 8, 9, 11, 15, 18, 19, 21, 25]`. Its 6th element is `11`. Two steps, no merge.

## Complexity

- **Time: O(log(min(m, n))).** Binary search over the `m + 1` possible values of `i`, with O(1) work per step.
- **Space: O(1).** A handful of variables. Nothing gets copied.

## Edge cases and traps

- **One array is empty.** `m = 0`, so the only option is `i = 0`. Both `nums1` neighbours become ±∞ and the answer comes entirely from `nums2`. The code handles it with no special case.
- **The cut sits at an edge.** `i = 0` means nothing from `nums1` is on the left, so `left1 = −∞`. `i = m` means `right1 = +∞`. Forget this and you'll index `nums1[-1]`, which Python silently reads as the *last* element. That's a nasty bug.
- **Integer division for the average.** `(3 + 4) / 2` must be `3.5`. In Java and C++, divide by `2.0`.
- **Overflow when using sentinels.** In C++ and Java we use 64-bit `long` for the neighbours, so ±∞ can be `LLONG_MIN`/`LLONG_MAX`. Then `max + min` never mixes an infinity with a real value in a way that overflows `int`. A real pair like `INT_MAX + INT_MAX` also stays safe.
- **Duplicates across arrays.** Use `<=`, not `<`, in the check. With `[1, 1]` and `[1, 1]`, every cut has equal neighbours, and `<` would reject all of them.

## Say it in the interview

> "The simple way is to merge with two pointers in O(m + n). To get logarithmic time, I think of the median as a cut. I split both arrays so the left side has half the elements and every left value is at most every right value. If I take i elements from the shorter array, the other array must give half minus i. So I binary search i. At each step I compare the four neighbours of the cuts. If the first array's left neighbour is too big, I move left. Otherwise I move right. That's O(log(min(m, n))) time and O(1) space."

## Follow-ups interviewers ask

- **"Find the k-th smallest of two sorted arrays instead."** Same idea, with the left half sized `k` instead of `half`. Or use the classic elimination: compare the `k/2`-th elements of each array and throw away `k/2` elements from the side whose value is smaller. That's O(log k).
- **"What if the numbers arrive one at a time and you need the median after each?"** That's a different problem: *Find Median from Data Stream*, in this same stage. It uses two heaps.
- **"Why not merge? It's only O(m + n)."** For one query, merging is fine. The partition idea matters when the arrays are huge or stored somewhere else, and you can only afford a few lookups.
