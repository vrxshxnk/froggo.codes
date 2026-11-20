---
id: lc-167
title: Two Sum II - Input Array Is Sorted
pattern: Two pointers from both ends
timeBox: 25
summary: In a sorted array, find the two numbers that add up to a target and return their 1-based positions, using only constant extra memory.
hints:
  - "The array is sorted. Look at the smallest and the largest number together. If their sum is too small, what does that tell you about the smallest number?"
  - "If numbers[left] + numbers[right] is less than the target, numbers[left] can't be in the answer: even its biggest possible partner isn't enough."
  - "Start with left at 0 and right at the end. If the sum is too small, move left up. If it's too big, move right down. Each step rules out one number for good."
insight: In a sorted array, the sum of the two ends tells you which end is useless. Too small means the left number can't reach the target with anyone, so drop it. Too big means the same for the right number. One pass, no hash map.
time: O(n)
space: O(1)
related: [lc-1, lc-15, lc-11]
---

## The problem in plain English

You get an array `numbers` sorted in **non-decreasing** order (each number is at least the one before it), and a `target`. Exactly one pair of different positions adds up to `target`. Return those two positions **1-indexed**, smaller first, as `[index1, index2]`.

Constraints that matter: up to 3·10⁴ numbers, each between −1000 and 1000. And the twist: **you may only use constant extra space.** That rules out the hash map from *Two Sum*.

Example: `numbers = [2, 7, 11, 15]`, `target = 9` → `[1, 2]`, because `2 + 7 = 9` and those sit at positions 1 and 2 when you count from 1.

## Start with brute force

Try every pair `i < j` and check `numbers[i] + numbers[j] == target`. It's correct, but for n = 3·10⁴ that's about n²/2 = 4.5·10⁸ checks, which is too slow.

The *Two Sum* trick, a hash map of values you've seen, gets you O(n) time. But it uses O(n) memory, which this problem forbids. So we need an idea that uses the fact the array is **sorted**.

## Building the intuition

Sorted arrays give you something very useful: if you know a sum is too small, you know exactly how to make it bigger.

Try `numbers = [1, 3, 4, 6, 8, 11]` with `target = 10`. Look at the two ends first: `1 + 11 = 12`. That's too big.

Now ask: **can 11 be part of the answer at all?** Its partner would sit somewhere in the array, and the smallest partner on offer is 1. Even `1 + 11` overshoots. Every other partner is at least 1, so every sum involving 11 is at least 12. **11 is useless.** Cross it off.

Now the ends are 1 and 8: `1 + 8 = 9`, too small. Same question for 1: its biggest remaining partner is 8, and even that falls short. So **1 is useless**. Cross it off.

You'll notice each comparison throws away one number forever, from one end or the other. The array shrinks from both sides until the pair is all that's left. That is the whole idea, and it only works because the array is sorted.

## The optimal approach

1. Set `left = 0` and `right = n - 1`.
2. While `left < right`, compute `total = numbers[left] + numbers[right]`.
   - If `total == target`, return `[left + 1, right + 1]`.
   - If `total < target`, do `left += 1`. The left number is too small even with the largest partner left.
   - If `total > target`, do `right -= 1`. The right number is too big even with the smallest partner left.
3. The problem guarantees an answer, so the loop always returns.

**The subtle detail:** why can't moving a pointer skip past the answer? Say the answer is `(a, b)` with `a < b`. Before `left` passes `a`, it would have to be sitting on `a` with the sum too small. But while `right` hasn't passed `b`, we have `numbers[right] ≥ numbers[b]`, so the sum is at least `numbers[a] + numbers[b] = target`. It's never too small. So `left` can't step off `a`, and by the same argument `right` can't step off `b`. Both pointers close in on the answer and stop there.

{{code}}

## Dry run

`numbers = [1, 3, 4, 6, 8, 11]`, `target = 10`

| left | right | numbers[left] + numbers[right] | Compared with 10 | Move |
|---|---|---|---|---|
| 0 | 5 | 1 + 11 = 12 | too big | right → 4 |
| 0 | 4 | 1 + 8 = 9 | too small | left → 1 |
| 1 | 4 | 3 + 8 = 11 | too big | right → 3 |
| 1 | 3 | 3 + 6 = 9 | too small | left → 2 |
| 2 | 3 | 4 + 6 = 10 | **equal** | return `[3, 4]` |

Five steps, and every step ruled out one number.

## Complexity

- **Time: O(n).** Each step moves one pointer inwards, and they start n − 1 apart, so there are at most n − 1 steps.
- **Space: O(1).** Two indices and a sum, which is exactly what the problem asks for.

## Edge cases and traps

- **Forgetting the +1.** The answer is 1-indexed. Returning `[left, right]` is the most common wrong answer on this problem.
- **Duplicates.** `[0, 0, 3, 4]` with target 0 returns `[1, 2]`. The two zeros are different positions, which is allowed.
- **Negative numbers.** Nothing assumes positivity. The only thing the logic relies on is the sorted order.
- **`left <= right`.** Using `<=` would let one element pair with itself. Use `left < right`.
- **Reaching for a hash map.** It works, but it breaks the constant-space rule. Interviewers asking this question want the two pointers.

## Say it in the interview

> "Since the array is sorted, I'll put one pointer at each end. If the sum is too small, the left number can't be in the answer, because even the biggest number left isn't enough for it, so I move left inwards. If the sum is too big, the right number is useless for the same reason, so I move right inwards. Every step discards one number, so it's O(n) time and O(1) space. I add one to both indices since the answer is 1-indexed."

## Follow-ups interviewers ask

- **"What if the array isn't sorted?"** Either use the hash map from *Two Sum* (O(n) time, O(n) space) or sort first (O(n log n) time, but you lose the original indices unless you sort `(value, index)` pairs).
- **"Find three numbers that sum to zero."** Fix one number, then run exactly this two-pointer scan on the rest. That's *3Sum*, the next problem.
- **"Count all pairs with sum ≤ target."** When `numbers[left] + numbers[right] ≤ target`, every index from `left + 1` to `right` also pairs with `left`. Add `right − left` to the count and move `left`. Still O(n).
