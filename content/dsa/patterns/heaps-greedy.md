---
module: heaps-greedy
title: Heaps & Greedy
readTime: 10
summary: "Heaps give you \"the smallest (or largest) item right now\" in O(log n), even while items keep arriving. Greedy algorithms make the best-looking choice and never look back. This stage teaches both, and how to prove out loud that a greedy choice is safe."
---

## Why this stage matters

Two slow ideas show up again and again in interviews.

The first: **"sort everything, then look at the top few."** Sorting costs O(n log n) and has to be redone every time a new item arrives. A heap keeps only the top in order, so adding an item or taking the best one costs O(log n). That's what you need for streams, simulations and "k-th largest" questions.

The second: **"try every combination."** Many optimisation problems look like they need a search over every choice. Some don't: there's one choice that's always safe, and you can make it on the spot. That's **greedy**. It's usually the easiest code you'll write all week, and the hardest to justify. Interviewers know that, so they will ask *"why does that work?"*. This stage teaches you to answer.

## The core idea: heaps

Think of a hospital emergency room. Patients don't get seen in arrival order. Whoever is most urgent goes next, and new patients keep arriving. The triage nurse doesn't rank the whole waiting room every time someone walks in. They just need to know **who is most urgent right now**.

A **heap** (or **priority queue**) is that nurse. It's a binary tree stored in an array, where every parent is smaller than its children (a **min-heap**) or larger (a **max-heap**). That rule is weaker than "fully sorted", which is why it's cheap to keep:

| Operation | Sorted array | Heap |
|---|---|---|
| Look at the smallest | O(1) | **O(1)** |
| Remove the smallest | O(1) from the end, but... | **O(log n)** |
| Insert one item | O(n): shift to make room | **O(log n)** |
| Build from n items | O(n log n) | **O(n)** (heapify) |
| Find any item / k-th item | O(1) / O(1) | O(n): not what heaps are for |

### Each language's heap, and its default ordering

This is where most heap bugs come from: **the defaults are different in each language.**

| Language | Type | Default | For the other order |
|---|---|---|---|
| Python | `heapq` functions on a list | **min-heap** | push `-x` for a max-heap |
| C++ | `priority_queue<int>` | **max-heap** | `priority_queue<int, vector<int>, greater<int>>` |
| Java | `PriorityQueue<Integer>` | **min-heap** | `new PriorityQueue<>(Collections.reverseOrder())` |
| JavaScript | none built in | — | write a small `MinHeap` class |

Python is a min-heap. C++ is a max-heap. Say it to yourself before you write the first line.

Common operations: Python `heappush(h, x)`, `heappop(h)`, `h[0]`, `heapify(h)`; C++ `push`, `pop` (returns nothing), `top`; Java `offer`, `poll`, `peek`.

JavaScript has no heap, and LeetCode's library isn't something you can count on in an interview, so every JavaScript solution in this stage that needs one carries the same short `MinHeap` class: `push` bubbles the new value up past bigger parents, and `pop` moves the last leaf to the root and sinks it toward the smaller child. Write it once from memory and it's yours.

## The core idea: greedy

A **greedy algorithm** builds the answer one step at a time, and at each step takes the choice that looks best right now, without ever undoing it. Kadane's algorithm drops a negative running sum. Jump Game keeps the farthest reach. Meeting Rooms II reuses the room that frees up first.

Greedy is fast because it never backtracks. It's dangerous for the same reason: if the locally best choice is ever wrong, nothing fixes it later.

### How to convince yourself (and an interviewer) that a greedy choice is safe

The standard tool is the **exchange argument**. In plain words:

1. Take **any** optimal answer, one you know nothing about except that it's optimal.
2. Suppose it differs from your greedy choice at the first step.
3. Show you can **swap** that step for your greedy choice without making the answer worse.
4. Now there's an optimal answer that agrees with greedy on that step. Repeat for the next step.

If you can always do the swap, greedy is never worse than optimal. So greedy *is* optimal.

Example, from *Taxi*: "Every 3 should share its taxi with a 1." Take any optimal plan where some 3 has an empty seat and some 1 is riding elsewhere. Move the 1 into the 3's taxi. Nothing got worse, and maybe a taxi emptied out. Swap done.

The second tool is a **matching lower bound**: show that *no* answer can beat some number, then show greedy hits it. *Meeting Rooms II* works this way. When greedy opens room `k`, `k` meetings overlap at that moment, so every plan needs `k` rooms.

In an interview, one sentence of either kind is enough: "It's safe because if an optimal schedule did something else here, I could swap in my choice without making it worse."

### How to spot when greedy fails

- **Try to break it before you code it.** Spend two minutes on small, nasty inputs: ties, all-equal values, one huge value, negatives.
- **The classic counterexample:** making change for 6 with coins `{1, 3, 4}`. Greedy takes 4 first, then 1, then 1: three coins. The best is 3 + 3: two coins. Biggest-coin-first works for some coin sets, like `{1, 2, 5, 10}`, but not for every set. That's why *Coin Change* lives in the Dynamic Programming stage.
- **A warning sign:** an early choice changes which choices are available later, in ways the "best right now" rule can't see. When that happens, think DP.
- **The test that never lies:** write a brute force over tiny inputs and compare it with your greedy on thousands of random cases. If greedy is wrong, you'll see a counterexample within seconds.

## The templates

### 1. Size-k min-heap: "the k largest" or "the k-th largest"

*Kth Largest Element in a Stream*, *Kth Largest Element in an Array*.

```python
import heapq

heap = []                     # min-heap holding the k largest seen so far
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)   # smallest of k + 1 can't be in the top k
answer = heap[0]              # weakest of the top k = k-th largest
```

The flip to remember: **the k largest use a min-heap; the k smallest use a max-heap.** The heap's top is the one about to be kicked out. O(n log k) time, O(k) space.

### 2. Max-heap simulation: "repeatedly take the biggest"

*Last Stone Weight*, the simulation in *Task Scheduler*.

```python
heap = [-x for x in items]    # negate: heapq is a min-heap
heapq.heapify(heap)
while len(heap) > 1:
    a = -heapq.heappop(heap)
    b = -heapq.heappop(heap)
    ...                       # combine, maybe push a result back
```

### 3. Sort, then a heap of "when things free up"

*Meeting Rooms II*.

```python
intervals.sort()              # by start time
ends = []                     # min-heap of end times of busy resources
for start, end in intervals:
    if ends and ends[0] <= start:
        heapq.heappop(ends)   # reuse the resource that frees up first
    heapq.heappush(ends, end)
rooms = len(ends)
```

### 4. One-pass greedy with a running value

*Maximum Subarray*, *Jump Game*.

```python
best = cur = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)     # greedy choice: drop a negative past
    best = max(best, cur)
```

Before coding one of these, say the one-line safety argument out loud.

## How to recognise this pattern

Reach for a **heap** when you see:

- "**k-th** largest / smallest", "**top k**", "k closest"
- a **stream**: numbers arriving one at a time, answer after each
- "repeatedly take the largest / smallest / earliest"
- merging several sorted things
- scheduling with **end times** or **cooldowns**

Reach for **greedy** when:

- the problem asks for a min or max and there's an obvious "best next move";
- sorting by one key makes the choice feel forced (earliest start, biggest group first);
- an O(n²) DP keeps only "the best so far", which often collapses into one variable.

## The mistakes everyone makes

1. **Wrong default ordering.** Writing `priority_queue<int>` in C++ when you wanted a min-heap, or forgetting to negate in Python. The code runs and gives a wrong number.
2. **Max-heap for "k largest".** It pops the best candidates. The capped heap must be a min-heap.
3. **Assuming a heap is sorted.** Only the top is guaranteed. `heap[1]` is *not* the second smallest.
4. **Trusting greedy without a reason.** If you can't state the exchange argument in one sentence, test against a brute force first.
5. **Off-by-one on touching intervals.** Does a meeting ending at 10 clash with one starting at 10? Read the problem and use `≤` or `<` deliberately.
6. **Initialising "best" to 0.** With all-negative input, the best subarray sum is negative.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Kth Largest Element in a Stream | Template 1 as a class: the size-k min-heap |
| Last Stone Weight | Template 2: a max-heap simulation, and negation in Python |
| Kth Largest Element in an Array | Template 1 again, plus quickselect as the follow-up |
| Task Scheduler | Greedy from a heap simulation down to a counting formula |
| Maximum Subarray | Template 4: Kadane, greedy and DP at the same time |
| Jump Game | Greedy with nothing to regret: track the frontier |
| Taxi (Codeforces) | Greedy by counts, defended with an exchange argument |
| Meeting Rooms II | Template 3: sort plus a min-heap of end times — the stage's boss |

Try each problem for its time box before opening the walkthrough. When your greedy idea works, make yourself say *why* it works before moving on. That sentence is what the interviewer is actually listening for.
