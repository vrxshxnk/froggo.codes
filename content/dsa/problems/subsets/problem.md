---
id: lc-78
title: Subsets
pattern: Backtracking with a start index
timeBox: 25
summary: Given a list of distinct numbers, return every possible subset of it, including the empty one and the full list.
hints:
  - "Each number has exactly two fates: it is in the subset or it isn't. How many subsets does that give for n numbers?"
  - "Build a subset one number at a time. Once you have picked nums[i], only consider numbers after position i next, so you never build {2, 1} after already building {1, 2}."
  - "Write a recursive function backtrack(start). On entry, save a copy of the current path. Then for every i from start to the end: add nums[i], call backtrack(i + 1), remove nums[i]."
insight: Every node in the decision tree is a subset, not only the leaves. Record the path the moment you arrive, then extend it only with elements to the right of the last one you picked, so each set is built exactly once.
time: O(n · 2ⁿ)
space: O(n)
related: [lc-39, lc-46, lc-22, lc-79]
---

## The problem in plain English

You get an array `nums` of **distinct** integers (no value repeats). Return every subset of it. A subset is any selection of the elements: none of them, some of them, or all of them. Order doesn't matter, so `[1, 2]` and `[2, 1]` are the same subset and must appear only once. You can return the subsets in any order.

The array has at most 10 numbers, so the answer has at most 2¹⁰ = 1024 subsets. That tiny limit is a signal: the problem expects you to list everything.

Example: `nums = [1, 2, 3]` → `[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]`. That's 8 subsets, which is 2³.

## Start with brute force

Here the "brute force" is already close to optimal, because the output itself has 2ⁿ subsets. You can't print 2ⁿ things in less than 2ⁿ steps.

One way to list them all is with **bitmasks**. Count from `0` to `2ⁿ − 1`. Each number's binary digits say which elements to include: `101` means "take element 0 and element 2". That works, and it's a nice follow-up answer. But it doesn't teach you the tool you'll need for the rest of this stage. Combination Sum, Permutations and Word Search don't have a neat bitmask shortcut. They all use **backtracking**, so learn it here, on the simplest problem.

## Building the intuition

Think about how you'd list the subsets of `[1, 2, 3]` by hand without missing any. You'd probably go in an organised way:

- Start with nothing: `[]`.
- Things starting with 1: `[1]`, then `[1, 2]`, then `[1, 2, 3]`, then back up and try `[1, 3]`.
- Things starting with 2 (and no 1, you've already done those): `[2]`, `[2, 3]`.
- Things starting with 3: `[3]`.

Notice two rules you followed without thinking:

1. **After you pick a number, you only add numbers to its right.** That's what stops you from writing `[2, 1]` after `[1, 2]`.
2. **"Back up" is a real step.** After `[1, 2, 3]` you removed the 3, then the 2, and tried 3 in the 2's place.

Draw it as a tree. Each node is the list so far. Each edge adds one number to the right of the last one picked:

```text
                    []
         /          |        \
       [1]         [2]       [3]
      /    \        |
  [1,2]   [1,3]   [2,3]
    |
 [1,2,3]
```

Count the nodes: 8. Every node is an answer, not only the leaves. So the code just has to walk this tree and save each node it visits.

Walking the tree means: **choose** a number (go down an edge), **explore** everything below it, then **un-choose** it (come back up) so the path is clean for the next branch. That's backtracking.

## The optimal approach

1. Keep one shared list `path` (the current node) and a `result` list.
2. Write `backtrack(start)`:
   - Append a **copy** of `path` to `result`. You've arrived at a node, and every node is a subset.
   - For each `i` from `start` to `n − 1`:
     - **Choose:** push `nums[i]` onto `path`.
     - **Explore:** call `backtrack(i + 1)`.
     - **Un-choose:** pop `nums[i]` off `path`.
3. Call `backtrack(0)` and return `result`.

**The subtle detail is the copy.** `path` is one list that keeps changing. If you append `path` itself, `result` ends up holding eight references to the same list, which is empty by the end. In Python write `path[:]`, in Java `new ArrayList<>(path)`, in JavaScript `[...path]`. C++'s `push_back(path)` already copies.

{{code}}

## Dry run

`nums = [1, 2, 3]`. "Save" means appending a copy of `path` to `result`.

| Step | Call | Action | `path` after | Saved so far |
|---|---|---|---|---|
| 1 | `bt(0)` | save | `[]` | `[]` |
| 2 | `bt(0)`, i = 0 | choose 1 → `bt(1)`, save | `[1]` | `[]`, `[1]` |
| 3 | `bt(1)`, i = 1 | choose 2 → `bt(2)`, save | `[1, 2]` | + `[1, 2]` |
| 4 | `bt(2)`, i = 2 | choose 3 → `bt(3)`, save; loop is empty | `[1, 2, 3]` | + `[1, 2, 3]` |
| 5 | back in `bt(2)` | un-choose 3, loop ends | `[1, 2]` | |
| 6 | back in `bt(1)` | un-choose 2; i = 2: choose 3 → save | `[1, 3]` | + `[1, 3]` |
| 7 | back in `bt(1)` | un-choose 3, loop ends | `[1]` | |
| 8 | back in `bt(0)` | un-choose 1; i = 1: choose 2 → save | `[2]` | + `[2]` |
| 9 | `bt(2)` | choose 3 → save | `[2, 3]` | + `[2, 3]` |
| 10 | back in `bt(0)` | un-choose down to `[]`; i = 2: choose 3 → save | `[3]` | + `[3]` |

Eight saves, eight subsets, and none repeated.

## Complexity

- **Time: O(n · 2ⁿ).** There are 2ⁿ nodes in the tree, one per subset. At each node we copy `path`, which has up to `n` elements.
- **Space: O(n)** extra, not counting the output. The recursion goes at most `n` levels deep, and `path` holds at most `n` numbers. The output itself is O(n · 2ⁿ).

## Edge cases and traps

- **Appending `path` instead of a copy.** It's the most common bug in every backtracking problem. You get a list of empty lists.
- **Forgetting the empty subset.** It's an answer too. Saving on arrival, before the loop, handles it.
- **Looping from 0 instead of `start`.** You'd build `[2, 1]` as well as `[1, 2]`, and `[1, 1]` too.
- **Recursing with `start + 1` instead of `i + 1`.** After picking `nums[i]`, the next pick must come after `i`, not after `start`.
- **Java's `path.remove(x)`.** On a `List<Integer>`, `remove(int)` removes by *index*. Always write `path.remove(path.size() - 1)`.

## Say it in the interview

> "There are 2ⁿ subsets, so I have to generate all of them, and the goal is to do it without duplicates. I'll backtrack. I keep a current path. Every time I enter the recursion I save a copy, because every node of the decision tree is a subset. Then I try adding each element from a start index onward, recurse with the next index, and pop it off afterwards. Only moving rightward means each set is built in one order only. That's O(n · 2ⁿ) time, which matches the output size, and O(n) extra space for the recursion."

## Follow-ups interviewers ask

- **"Can you do it without recursion?"** Yes, with bitmasks: for every `mask` from `0` to `2ⁿ − 1`, include `nums[i]` when bit `i` is set. Or build iteratively: start with `[[]]`, and for each number, add a copy of every existing subset with that number appended.
- **"What if `nums` has duplicates?"** (That's LeetCode's *Subsets II*.) Sort first. Then inside the loop, skip `nums[i]` when `i > start` and `nums[i] == nums[i − 1]`, so a value is only chosen once at each tree level.
- **"Only subsets of size k?"** Same tree, but save only when `len(path) == k`, and stop going deeper once you reach `k`.
