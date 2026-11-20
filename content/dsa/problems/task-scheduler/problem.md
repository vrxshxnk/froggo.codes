---
id: lc-621
title: Task Scheduler
pattern: Greedy frame around busiest task
timeBox: 25
summary: Given CPU tasks labelled A to Z and a cooldown n between two runs of the same label, return the fewest time slots needed to finish them all.
hints:
  - "The order of the other tasks barely matters. Which task forces the CPU to sit idle?"
  - "Lay out the most frequent task first: A, then n gaps, then A, then n gaps... How many slots does that skeleton take? Where do the other tasks go?"
  - "If the busiest task appears f times and m tasks are tied at f, the skeleton is (f − 1) × (n + 1) + m slots. Other tasks fill the gaps. If they overflow the gaps, nobody idles and the answer is just the number of tasks. Return the larger of the two."
insight: The most frequent task builds a frame of f rows, each n + 1 wide. Everything else fits into the gaps, so the answer is the frame size (f − 1)(n + 1) + m, unless there are so many tasks that no idling is needed at all.
time: O(m)
space: O(1)
related: [lc-1046, lc-347, lc-253]
---

## The problem in plain English

You get a list `tasks` of uppercase letters. Each letter is a kind of task, and each task takes exactly one time slot. You also get a cooldown `n`: between two runs of the **same** letter there must be at least `n` other slots (other tasks, or idle slots where the CPU does nothing). You can run the tasks in any order.

Return the minimum number of slots needed to finish everything, idle slots included. There are up to 10⁴ tasks and `0 ≤ n ≤ 100`.

Example: `tasks = [A, A, A, B, B, B]`, `n = 2` → `8`:

```text
A B idle A B idle A B
```

Each `A` is 3 slots after the previous one, so there are 2 slots in between. With `n = 0`, the answer would just be 6.

## Start with brute force

Trying every order of the tasks is hopeless: 10⁴ tasks have 10⁴! orders.

The first *real* solution is a simulation. Go one slot at a time. In each slot, run the task with the **most copies left** among those not cooling down, or idle if every task is cooling down. The busiest task is the one that's hardest to fit, so it should never wait if it doesn't have to. A max-heap holds the counts, and a queue holds tasks that are cooling down along with the slot when they become ready again:

```python
def leastInterval(tasks, n):
    heap = [-c for c in Counter(tasks).values()]   # max-heap of remaining counts
    heapq.heapify(heap)
    cooling = deque()                              # (remaining count, ready-at slot)
    time = 0
    while heap or cooling:
        time += 1
        if heap:
            left = heapq.heappop(heap) + 1         # run one copy (counts are negative)
            if left < 0:
                cooling.append((left, time + n))
        if cooling and cooling[0][1] == time:
            heapq.heappush(heap, cooling.popleft()[0])
    return time
```

This is correct and it's what many people write in interviews. It costs O(answer · log 26). That's fine here, but it spends one loop per slot, idle slots included. Looking at the shape of its output leads to a one-line formula.

## Building the intuition

Run the simulation on `AAABBBCCD` with `n = 2` and write the schedule in rows of width `n + 1 = 3`:

```text
A B C
A B C
A B D
```

Now try `AAAAB`, `n = 2`:

```text
A B idle
A idle idle
A idle idle
A
```

The busiest task, `A`, sets up a **frame**. If it appears `f` times, it needs `f` rows. Each row except the last is `n + 1` slots wide: one `A`, then `n` slots for others. The last row holds only the tasks that appear `f` times too; they have no cooldown to wait out after that.

So with `m` tasks tied for the top count, the frame has

```text
(f − 1) × (n + 1) + m   slots
```

Every other task fits into the gaps. Fill the gaps column by column, taking the other tasks in order of count. A task with fewer than `f` copies never ends up closer than `n + 1` slots to its own next copy. Any gap nobody fills is an idle slot. That's why the frame size is the answer.

What if there are **more** tasks than gaps? Then you just widen the rows. Each row gets longer than `n + 1`, the cooldown is more than satisfied, and nobody ever idles. The answer is then simply `len(tasks)`.

Both cases in one line: `max(len(tasks), (f − 1) × (n + 1) + m)`.

This is a greedy argument: the busiest task is the bottleneck. In any schedule, each of the `m` tied tasks has its last copy at slot `(f − 1)(n + 1) + 1` or later, and those `m` last copies need `m` different slots. And no schedule can be shorter than the number of tasks. We hit the larger of those lower bounds exactly, so nothing can beat us.

## The optimal approach

1. Count each letter in a 26-slot array.
2. `f` = the largest count. `m` = how many letters have count `f`.
3. `frame = (f − 1) × (n + 1) + m`.
4. Return `max(frame, len(tasks))`.

The subtle detail is **`m`, the tie count**. With `AAABBB`, `n = 2`, a frame of `(3 − 1) × 3 + 1 = 7` is wrong. `B` also appears 3 times, so the last row is `A B`, not `A`, and the answer is 8.

{{code}}

## Dry run

| tasks | n | f | m | frame = (f − 1)(n + 1) + m | len | Answer |
|---|---|---|---|---|---|---|
| `AAABBB` | 2 | 3 | 2 | 2 × 3 + 2 = 8 | 6 | **8** |
| `AAABBB` | 3 | 3 | 2 | 2 × 4 + 2 = 10 | 6 | **10** |
| `AAABBBCCD` | 2 | 3 | 2 | 2 × 3 + 2 = 8 | 9 | **9** (rows widen, no idle) |
| `AAAAAABCDEFG` | 2 | 6 | 1 | 5 × 3 + 1 = 16 | 12 | **16** |

The last one in rows of 3: `A B C / A D E / A F G / A _ _ / A _ _ / A` → 16 slots.

## Complexity

- **Time: O(m)** for `m` tasks. One pass to count, then a scan of 26 counters.
- **Space: O(1).** The count array always has 26 slots.

## Edge cases and traps

- **Forgetting the tie count.** `AAABBB` must give 8. Using `+ 1` instead of `+ m` gives 7.
- **Forgetting `max(..., len(tasks))`.** With `n = 0`, or with many distinct tasks, the frame is smaller than the number of tasks. `ABCDEF`, `n = 3` → frame 1, answer 6.
- **Counting idle after the last row.** The final row has no trailing gaps: that's why it's `(f − 1)` full rows plus `m`, not `f` full rows.
- **Thinking the cooldown is `n + 1`.** `n` slots must sit *between* two copies, so copies are `n + 1` apart.
- **Char arithmetic.** `t - 'A'` in C++ and Java; `ord(t) - ord("A")` in Python; `t.charCodeAt(0) - 65` in JavaScript.

## Say it in the interview

> "The most frequent task is the bottleneck. If it appears f times, it needs f − 1 full rows of width n + 1, plus a last row with every task that's tied at count f. That's (f − 1)(n + 1) + m slots, and every other task fits into the gaps without breaking its cooldown. If there are more tasks than gaps, I widen the rows and nobody idles, so the answer is just the task count. So I return the max of the two. It's O(n) to count and O(1) space. I can also show the heap simulation, which is how I'd generate the actual schedule."

## Follow-ups interviewers ask

- **"Return the actual schedule, not just its length."** Use the heap simulation from the brute-force section and record what runs in each slot.
- **"What if tasks must run in the given order?"** Then there's no choice to make. Walk the list, keep a hash map of the earliest slot each letter may run next, and jump time forward when needed.
- **"Rearrange a string so no two equal letters are adjacent."** That's this problem with `n = 1`. It's possible only if `f ≤ (len + 1) / 2`, and the "most remaining first" heap builds it.
