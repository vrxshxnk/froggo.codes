---
id: lc-46
title: Permutations
pattern: Backtracking with a used array
timeBox: 25
summary: Given a list of distinct numbers, return every possible ordering of them.
hints:
  - "Fill the answer one position at a time. For the first position you have n choices, for the second n − 1, and so on."
  - "Unlike Subsets, [1, 2] and [2, 1] are different answers here. So the loop can't start from a start index; any number not used yet may go next."
  - "Keep a boolean array used[]. In the loop, skip used numbers; otherwise mark it used, append it, recurse, then pop it and unmark it. Save the path when its length is n."
insight: Order matters, so every position may take any number that isn't already placed. A used[] array answers 'is this one taken?' in O(1), and un-choosing must undo both the append and the mark.
time: O(n · n!)
space: O(n)
related: [lc-78, lc-39, lc-22]
---

## The problem in plain English

You get an array `nums` of **distinct** integers, at most 6 of them. Return every permutation: every way to arrange all the numbers in a row. Here order matters, so `[1, 2, 3]` and `[3, 2, 1]` are different answers. Return the permutations in any order.

Example: `nums = [1, 2, 3]` → `[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]`. That's 3! = 3 × 2 × 1 = 6 arrangements.

The limit of 6 means at most 6! = 720 answers. The problem is asking you to list them all cleanly.

## Start with brute force

A naive way: generate every sequence of length `n` where each position can be any of the `n` numbers (that's `nⁿ` sequences), and keep only the ones with no repeated number. For `n = 6` that's 46,656 sequences to get 720 answers. About 98% of the work is thrown away.

The waste comes from choosing a number that's already in the sequence and only noticing at the end. If you refuse to choose a used number in the first place, every branch you walk leads to a real answer.

## Building the intuition

How would you write out the permutations of `[1, 2, 3]` by hand? Probably like this:

- Put 1 first. Then the rest, `[2, 3]`, in every order: `1 2 3`, `1 3 2`.
- Put 2 first. Then `[1, 3]` in every order: `2 1 3`, `2 3 1`.
- Put 3 first. Then `[1, 2]`: `3 1 2`, `3 2 1`.

At each position you ask, "which numbers haven't I placed yet?", and try each of them in turn. As a tree:

```text
                    []
         /          |          \
       [1]         [2]         [3]
      /   \       /   \       /   \
  [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]
    |     |     |     |     |     |
 [1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]
```

Compare it with the *Subsets* tree. Two differences:

1. **Only the leaves are answers.** A permutation must use every number, so you save only when the path has length `n`.
2. **The loop restarts from 0 at every level.** In Subsets, after picking 2 you never looked at 1 again, because `{2, 1}` was the same set as `{1, 2}`. Here `[2, 1, 3]` is a new answer, so after picking 2 you *must* be able to pick 1.

So you need a fast way to ask "is `nums[i]` already in the path?". Scanning the path costs O(n). A boolean array `used`, where `used[i]` is true while `nums[i]` sits in the path, answers it in O(1).

## The optimal approach

1. Keep `path`, `result`, and `used = [False] * n`.
2. Write `backtrack()`:
   - If `len(path) == n`, save a copy of `path` and return.
   - For each `i` from `0` to `n − 1`:
     - If `used[i]`, skip it.
     - **Choose:** set `used[i] = True`, push `nums[i]`.
     - **Explore:** call `backtrack()`.
     - **Un-choose:** pop `nums[i]`, set `used[i] = False`.
3. Call `backtrack()` and return `result`.

**The subtle detail: un-choose means undo *everything* you did when you chose.** Here choosing changed two things, the path and the `used` array. If you pop from `path` but forget `used[i] = False`, then after the first branch, number 1 stays "used" forever. You'd only get the permutations starting with 1. The rule for every backtracking problem: the state after un-choose must be exactly the state before choose.

{{code}}

## Dry run

`nums = [1, 2, 3]`. `used` is written as three flags for positions 0, 1, 2.

| Step | `path` | `used` | What happens |
|---|---|---|---|
| 1 | `[]` | F F F | i = 0: choose 1 |
| 2 | `[1]` | T F F | i = 0 used, skip; i = 1: choose 2 |
| 3 | `[1, 2]` | T T F | i = 2: choose 3 |
| 4 | `[1, 2, 3]` | T T T | length 3: **save** |
| 5 | `[1, 2]` | T T F | un-choose 3; loop ends; un-choose 2 |
| 6 | `[1]` | T F F | i = 2: choose 3 |
| 7 | `[1, 3]` | T F T | i = 1: choose 2 → `[1, 3, 2]` **save** |
| 8 | `[1]` → `[]` | F F F | un-choose 2, 3, then 1 |
| 9 | `[]` | F F F | i = 1: choose 2 → `[2]`, then 1 → 3 gives **`[2, 1, 3]`** |
| 10 | … | … | the same pattern gives `[2, 3, 1]`, `[3, 1, 2]`, `[3, 2, 1]` |

After step 8 everything is back to `F F F`, which is exactly why the 2-first branch can use 1 again.

## Complexity

- **Time: O(n · n!).** There are `n!` leaves. Copying each one costs O(n). The inner levels of the tree add up to fewer nodes than the leaves times a small factor, and each node's loop checks `n` slots, so the total stays within O(n · n!).
- **Space: O(n)** extra for the recursion depth, `path` and `used`. The output itself takes O(n · n!).

## Edge cases and traps

- **Forgetting `used[i] = False`.** The classic bug. You'd only see permutations that begin with the first number.
- **Checking `nums[i] in path` instead of `used[i]`.** It's correct for distinct numbers but costs O(n) per check. It also breaks as soon as values repeat.
- **Starting the loop at a `start` index.** That's the Subsets loop. You'd only get `[1, 2, 3]`.
- **Saving `path` itself.** Save a copy, or every answer ends up empty.
- **One element.** `[1]` returns `[[1]]`. The base case handles it.

## Say it in the interview

> "Order matters, so this is a different tree from Subsets. At each level any number not yet placed can go next, and I only save at the leaves, when the path has all n numbers. I keep a boolean used array so 'is this taken?' is O(1). I mark it and append it, recurse, then pop and unmark, so the state is clean for the next branch. There are n! leaves and each copy costs n, so it's O(n · n!) time and O(n) extra space."

## Follow-ups interviewers ask

- **"Can you do it without the used array?"** Yes, by swapping. At depth `d`, swap each `nums[i]` (for `i ≥ d`) into position `d`, recurse on `d + 1`, then swap back. The prefix `nums[0..d−1]` is the path, and the suffix is the set of unused numbers.
- **"What if `nums` has duplicates?"** (That's *Permutations II*.) Sort, and skip `nums[i]` when `nums[i] == nums[i − 1]` and `used[i − 1]` is false. That means an equal copy was already tried at this position.
- **"Only the next permutation, not all of them?"** Use LeetCode's *Next Permutation* method: find the rightmost dip, swap it with the next larger value to its right, and reverse the suffix. That's O(n) with no recursion.
