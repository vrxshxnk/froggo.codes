---
module: bonus-gauntlet
title: "Hard DP & The Gauntlet: How to Attack a Hard Problem"
readTime: 11
summary: Hard problems are rarely a brand-new idea. They're usually two Medium patterns you already know, stacked together. This stage teaches you to take a Hard apart, to recognise interval DP (the one genuinely new tool here), and to keep scoring points in an interview even when you can't finish.
---

## Why this stage matters

By now you've met every core pattern: hashing, two pointers, sliding windows, stacks, binary search, heaps, trees, graphs and DP. A Hard problem looks scary because it doesn't fit any **one** of them. You read it and your template search comes back empty.

Here's the secret: **most Hards are two Mediums stacked together.** *Trapping Rain Water* is the prefix-max idea from *Product of Array Except Self* combined with the "move the shorter side" idea from *Container With Most Water*. *Binary Tree Maximum Path Sum* is *Diameter of Binary Tree* combined with *Maximum Subarray*. Once you can name the two halves, the problem stops being a wall and becomes two steps you've already practised.

This stage is eleven of those. The slow idea it replaces is "I need a flash of genius". The new one is "Which two things I already know does this combine?"

## The core idea

Think of a Hard like a locked box with two locks. Most students stare at the box. Instead, look for the two keyholes separately. Each one takes a key you already own.

The precise version is a short checklist you run in the first five minutes:

1. **Solve it slowly first.** Write the brute force, even if it's O(n³) or exponential. It tells you exactly what work is being repeated.
2. **Find the bottleneck.** What does the brute force recompute? A max over a range, a search for a partner, a subproblem it has seen before?
3. **Ask: which tool kills that repeat?** Running maxes, a heap, a monotonic stack, a cache, binary search.
4. **Look for the reframe.** Many Hards need one change of viewpoint before the tool fits. Examples: "the shortest bar limits the rectangle", "which balloon goes *last*", "how many floors can m moves handle".

## The pairs in this stage

| Problem | Medium idea 1 | Medium idea 2 |
|---|---|---|
| Median of Two Sorted Arrays | The median is a balanced cut | Binary search on that cut |
| Merge k Sorted Lists | Merge Two Sorted Lists | A min-heap of k candidates |
| Minimum Window Substring | Variable sliding window | Frequency counts with a "missing" counter |
| Largest Rectangle in Histogram | Fix the bottleneck (the shortest bar) | Nearest smaller element with a monotonic stack |
| Binary Tree Maximum Path Sum | Diameter-style "return one, record another" DFS | Kadane's "drop negative sums" |
| Find Median from Data Stream | A heap gives the top of a group | Split the data at the median |
| Trapping Rain Water | Prefix and suffix maxes | Two pointers that move the weaker side |
| Burst Balloons | Interval DP | Choosing the *last* action, not the first |
| Longest Increasing Path in a Matrix | Grid DFS | Memoisation on a DAG |
| Distinct Subsequences | The two-string DP table from LCS | Counting (add the ways) instead of maximising |
| Super Egg Drop | Min-max DP | Binary search, then flipping the state |

## Interval DP: the one new tool

Everything above you've seen before, except **interval DP**. It shows up when:

- the input is a row (an array or a string);
- an action in the middle changes its neighbours, so you can't just go left to right;
- the state is naturally a **range** `[l, r]`.

The shape: solve `dp[l][r]` by trying every split point `k` inside the range. The split must make the two sides **independent**. In *Burst Balloons*, choosing the first balloon to burst doesn't do that, because its neighbours join up. Choosing the **last** one does: while it stands, it's a wall between the two sides.

```python
# dp[l][r] = best answer for the open range strictly between l and r
for length in range(2, n):            # short ranges first
    for l in range(0, n - length):
        r = l + length
        dp[l][r] = max(
            dp[l][k] + cost(l, k, r) + dp[k][r]
            for k in range(l + 1, r)
        )
```

That's O(n²) states times O(n) splits, so **O(n³)** time. Fine for n up to a few hundred. The two things to get right: **fill short ranges before long ones**, and **choose the split that makes the halves independent**.

## The templates

### 1. Return one thing, record another (tree DFS)

When a tree answer "bends" at a node but only a straight chain can be passed up to the parent.

```python
best = float("-inf")
def dfs(node):
    global best
    if not node:
        return 0
    left, right = max(dfs(node.left), 0), max(dfs(node.right), 0)
    best = max(best, node.val + left + right)   # record: uses both sides
    return node.val + max(left, right)          # return: one side only
```

### 2. Nearest smaller with a monotonic stack

When each element's answer depends on the first smaller (or bigger) element on each side.

```python
stack = []
for i, h in enumerate(heights + [0]):           # sentinel flushes the stack
    while stack and heights[stack[-1]] >= h:
        top = stack.pop()
        left = stack[-1] if stack else -1        # nearest smaller on the left
        use(top, left, i)                        # i is the nearest smaller on the right
    stack.append(i)
```

### 3. Two heaps around the middle

When you need the median, or any "middle" statistic, of a growing collection.

```python
low, high = [], []                               # max-heap (negated), min-heap
def add(x):
    heapq.heappush(low, -x)
    heapq.heappush(high, -heapq.heappop(low))
    if len(high) > len(low):
        heapq.heappush(low, -heapq.heappop(high))
```

### 4. Memoised DFS on a DAG

When the moves can't loop back (values strictly increase, time moves forward), so "best from here" doesn't depend on the path so far.

```python
@functools.lru_cache(None)
def best_from(state):
    return 1 + max((best_from(nxt) for nxt in moves(state)), default=0)
```

## How to recognise this pattern

- **"Median", "k-th", "in O(log n)"** over sorted data → binary search on a partition, or two heaps if the data streams in.
- **"Merge k …"** or "smallest among many candidates, repeatedly" → a min-heap.
- **"Shortest substring containing …"** → a sliding window with counts.
- **"Largest rectangle", "water between bars", "next smaller/bigger"** → a monotonic stack or two pointers with running maxes.
- **"Path anywhere in a tree"** → a DFS that returns a chain and records a bend.
- **Bursting, merging or removing items from a row, where neighbours change** → interval DP. Think about the *last* action.
- **"Count the ways"** with two strings → a 2-D DP that adds instead of maxing.
- **A DP with a min or max over a choice that's too slow** → look for monotonicity (binary search the choice), or flip what the state measures.

## How to talk through a Hard you can't finish

Interviewers grade the process, not just the final code. A clear partial answer often beats a silent half-optimal one. When you're stuck:

1. **Restate and give a small example in your own words.** It shows you understand the question, and it often reveals the trick.
2. **Say the brute force out loud, with its complexity.** "Trying every order is n!, and memoising on the set of remaining balloons is 2ⁿ." Now you have a correct answer on the board.
3. **Name the repeated work.** "The brute force recomputes the left max for every bar." This is where the interviewer starts nodding.
4. **Propose an improvement, even an incomplete one.** "If I knew the nearest shorter bar on each side, each bar would be O(1). I think a stack finds those." Partial ideas earn hints. Silence earns nothing.
5. **Code what you're sure of.** A clean O(n log n) solution that works beats an O(n) one that doesn't. Say what you'd change to reach the optimum.
6. **Test with your example.** Trace the code by hand, out loud. Catching your own bug is a strong signal.

## The mistakes everyone makes

1. **Jumping to code.** On a Hard, the first idea is usually the brute force in disguise. Spend the first minutes on the reframe.
2. **Choosing the wrong "first" decision.** In *Burst Balloons*, the first burst couples the subproblems. Ask which choice makes the pieces independent.
3. **Missing sentinels and edges.** −∞/+∞ around partitions, a height-0 bar at the end of a histogram, padding with 1s. Most Hard bugs live at the edges.
4. **Wrong fill order in DP.** Interval DP fills by length. A 1-D rolled DP loops right to left when it reads the previous row's left neighbour.
5. **Overflow in cells that "don't matter".** *Distinct Subsequences* has cells far bigger than its answer. Know what your language does on overflow.
6. **Giving up silently.** See the section above. Talk through it.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Median of Two Sorted Arrays | Binary search on a partition, not on a value |
| Merge k Sorted Lists | A heap of k candidates turns k·N into N log k |
| Minimum Window Substring | Grow-then-shrink window with an O(1) validity counter |
| Largest Rectangle in Histogram | Enumerate by the bottleneck; nearest smaller via a stack |
| Binary Tree Maximum Path Sum | Return a chain, record a bend |
| Find Median from Data Stream | Two heaps kept balanced around the middle |
| Trapping Rain Water | The shorter wall decides, so it can be settled now |
| Burst Balloons | Interval DP: choose the last action |
| Longest Increasing Path in a Matrix | Strictly increasing means a DAG, so memoise DFS |
| Distinct Subsequences | Counting DP on two strings, rolled to one row |
| Super Egg Drop | Flip the state: how much can m moves cover? |

Each of these deserves its full 40-minute time box before you open the walkthrough. Struggling with a Hard and then seeing which two ideas it combined is exactly the practice that makes the next Hard feel like a Medium.
