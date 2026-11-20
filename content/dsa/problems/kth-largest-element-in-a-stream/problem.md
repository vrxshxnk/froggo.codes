---
id: lc-703
title: Kth Largest Element in a Stream
pattern: Size-k min-heap
timeBox: 15
summary: Build a class that receives numbers one at a time and, after each one, reports the k-th largest number seen so far.
hints:
  - "You never need to answer about anything below the top k. Which numbers can you safely forget forever?"
  - "Keep only the k largest numbers you've seen. The answer is the smallest of those k. Which data structure hands you its smallest element instantly?"
  - "Use a min-heap capped at size k. On every add, push the new number; if the heap now has k + 1 items, pop the smallest. The top of the heap is the answer."
insight: Only the k largest numbers ever matter, and the answer is the smallest of them. A min-heap of size k keeps exactly those, with the answer sitting on top.
time: O(log k) per add
space: O(k)
related: [lc-215, lc-347, lc-1046, lc-295]
---

## The problem in plain English

Design a class `KthLargest`:

- `KthLargest(k, nums)` sets it up with a number `k` and a starting list `nums` (which can be empty).
- `add(val)` adds one more number to the stream and returns the **k-th largest** number seen so far, counting duplicates. "k-th largest" means: sort everything from biggest to smallest and take position `k` (1-based).

It is guaranteed that by the time you answer, at least `k` numbers have arrived. There can be up to 10⁴ starting numbers and up to 10⁴ calls to `add`.

Example: `k = 3`, `nums = [4, 5, 8, 2]`.

- `add(3)`: the numbers are `8, 5, 4, 3, 2`. The 3rd largest is `4`.
- `add(5)`: `8, 5, 5, 4, 3, 2` → `5`.
- `add(10)`: `10, 8, 5, 5, 4, 3, 2` → `5`.

## Start with brute force

Keep every number in a list. On each `add`, append the number, sort the list biggest-first, and return element `k − 1`.

It is obviously correct. But each sort costs O(n log n), and you sort on every call. With 10⁴ starting numbers and 10⁴ adds, that is 10⁴ sorts of up to 2·10⁴ numbers each: roughly 3·10⁹ steps. Keeping the list sorted with binary-search insertion helps, but inserting into the middle of an array still shifts O(n) elements every time.

## Building the intuition

Look at the example again with `k = 3`. After `add(10)` the numbers are `10, 8, 5, 5, 4, 3, 2`. Ask yourself: will `2` ever be the answer again?

No. Three numbers bigger than it (10, 8, 5) are already in, and numbers never leave the stream. So `2` can only ever be 4th largest or worse. The same goes for `3` and `4`. **Anything below the current top k is dead forever.**

So you only need to remember the top `k` numbers. Picture a leaderboard with exactly `k` places:

- The answer is the person in **last place** on the leaderboard: the smallest of the top `k`.
- When a new number arrives, it gets on the board only if it beats last place. Then last place drops off.

Both steps need fast access to the **smallest** element of a small collection that keeps changing. That is exactly what a **min-heap** gives you: the smallest item is always on top, readable in O(1), removable in O(log k).

It feels backwards: you want the *largest* numbers, so you use a *min*-heap. That is the trick. The min-heap holds the k biggest numbers, and its top is the weakest of them, which is precisely the k-th largest.

## The optimal approach

1. Store `k` and an empty min-heap.
2. In the constructor, call `add` on every starting number (ignore the return values).
3. `add(val)`:
   - push `val`;
   - if the heap now has more than `k` items, pop the smallest;
   - return the top of the heap.

The subtle detail: the constructor may receive only `k − 1` numbers (or none). That's why we **don't** pop down to `k` blindly or read the top inside the constructor. We only pop when the size goes *over* `k`, and the guarantee says that by the first answer we read, the heap is full.

A simpler-to-explain variant pushes only when `val` beats the top. "Push, then pop if too big" does the same thing in fewer lines.

### Why the JavaScript version has its own heap class

JavaScript has no built-in heap. LeetCode's JavaScript runtime happens to include a priority-queue library, but an interview editor or an online assessment may not, so the solution carries a short `MinHeap` class: `push` adds at the end and bubbles the value up while it is smaller than its parent; `pop` moves the last element to the root and sinks it toward the smaller child. Learn to write it once; you will reuse it all through this stage.

{{code}}

## Dry run

`k = 3`, `nums = [4, 5, 8, 2]`, then `add(3), add(5), add(10), add(9), add(4)`.

| Call | Heap after push | Size > 3? | Heap after | Returns |
|---|---|---|---|---|
| ctor: 4, 5, 8 | `{4, 5, 8}` | no | `{4, 5, 8}` | — |
| ctor: 2 | `{2, 4, 5, 8}` | yes, pop 2 | `{4, 5, 8}` | — |
| `add(3)` | `{3, 4, 5, 8}` | yes, pop 3 | `{4, 5, 8}` | **4** |
| `add(5)` | `{4, 5, 5, 8}` | yes, pop 4 | `{5, 5, 8}` | **5** |
| `add(10)` | `{5, 5, 8, 10}` | yes, pop 5 | `{5, 8, 10}` | **5** |
| `add(9)` | `{5, 8, 9, 10}` | yes, pop 5 | `{8, 9, 10}` | **8** |
| `add(4)` | `{4, 8, 9, 10}` | yes, pop 4 | `{8, 9, 10}` | **8** |

The heap never holds more than 4 numbers, however long the stream gets.

## Complexity

- **Time: O(log k) per `add`.** One push and at most one pop on a heap of size at most `k + 1`. The constructor is O(n log k) for `n` starting numbers.
- **Space: O(k).** We keep only the top `k` numbers, not the whole stream.

## Edge cases and traps

- **Using a max-heap.** A max-heap's top is the largest number, which is the answer only when `k = 1`. You want the smallest of the top `k`, so it must be a min-heap.
- **C++ default ordering.** `priority_queue<int>` is a **max**-heap. You need `priority_queue<int, vector<int>, greater<int>>`.
- **Fewer than k starting numbers.** `k = 3`, `nums = [5]` is legal. Don't read `heap[0]` or pop down to size `k` in the constructor as if the heap were full.
- **Duplicates count separately.** With `[5, 5, 8]` and `k = 2`, the answer is `5`, not `8`. A heap keeps duplicates naturally; a set would lose them.
- **Storing the whole stream.** It still passes, but it wastes memory and makes every operation slower. The point of the problem is to forget what can't matter.

## Say it in the interview

> "Once a number has k bigger numbers above it, it can never be the k-th largest again, because numbers only get added. So I only keep the k largest numbers, in a min-heap. The top of that heap is the smallest of the top k, which is exactly the answer. Each add pushes the new value and pops if the heap goes over size k, so it's O(log k) per add and O(k) space. The constructor just calls add on every starting number, and I'm careful not to assume the heap is full until the first real query."

## Follow-ups interviewers ask

- **"What about the k-th smallest?"** Mirror it: a max-heap of size `k`, popping the largest when it overflows.
- **"What if numbers could also be removed?"** Then forgotten numbers might come back into the top `k`, so a capped heap is not enough. Use a balanced BST or sorted container (C++ `multiset`, Java `TreeMap` with counts) holding everything.
- **"What if they ask for the median instead?"** Two heaps: a max-heap for the lower half and a min-heap for the upper half. That is *Find Median from Data Stream* in the Gauntlet bonus stage.
