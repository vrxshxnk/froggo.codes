---
id: lc-253
title: Meeting Rooms II
pattern: Min-heap of end times
timeBox: 25
summary: Given meeting start and end times, return the fewest rooms needed so that no two overlapping meetings share a room.
hints:
  - "Process the meetings in the order they start, like a receptionist handing out rooms through the day. When a meeting arrives, which room should you check first?"
  - "Check the room that frees up earliest. If even that one is still busy, every room is busy and you need a new one. What structure gives you the earliest end time quickly?"
  - "Sort by start time. Keep a min-heap of end times, one per room in use. For each meeting, if the heap's top is ≤ its start, pop it (that room is free again). Then push the meeting's end. The heap's size at the end is the answer."
insight: Hand out rooms in start order, always reusing the room that frees up first. A min-heap of end times gives you that room in O(log n), and you only open a new room when every room is genuinely busy.
time: O(n log n)
space: O(n)
related: [lc-56, lc-57, lc-215]
---

## The problem in plain English

**This is a LeetCode Premium problem.** If you don't have Premium, LintCode 919 (Meeting Rooms II) is the same problem for free.

You get a list `intervals` where `intervals[i] = [start, end]` is one meeting. A meeting occupies its room from `start` up to, but not including, `end`. So a meeting ending at 10 and another starting at 10 **can** use the same room. Return the minimum number of rooms needed so that no room ever hosts two meetings at once.

There are up to 10⁴ meetings, with `0 ≤ start < end ≤ 10⁶`.

Example: `[[0, 30], [5, 10], [15, 20]]` → `2`. The long meeting `[0, 30]` needs a room all day. `[5, 10]` and `[15, 20]` don't overlap each other, so they share a second room.

## Start with brute force

The number of rooms you need is the largest number of meetings happening **at the same moment**. And that peak always happens at some meeting's start time, because the count only goes up when a meeting starts.

So for every meeting's start time `t`, count how many meetings satisfy `start ≤ t < end`, and return the largest count. That's correct, and it's O(n²): for `n = 10⁴`, 10⁸ checks. Slow, and it doesn't scale.

## Building the intuition

Pretend you're the receptionist. Meetings show up in the order they start, and you hand each one a room.

A new meeting arrives at time `s`. You can give it any room whose current meeting has already ended. Which room do you look at? **The one that frees up earliest.** If that room is free by `s`, reuse it. If even the earliest-freeing room is still busy at `s`, then every room is busy, and you have no choice but to open a new one.

So the one question you keep asking is "what's the **smallest** end time among the rooms in use?" Rooms keep getting new meetings, so that set changes all the time. That's a **min-heap** of end times.

Why is reusing the earliest-freeing room safe? Two answers, both worth saying:

- **Exchange argument:** if some optimal plan put this meeting in a different free room, swapping it into the earliest-freeing free room never causes a clash. Both rooms were free at `s`.
- **Lower bound:** we only open room number `k` when the other `k − 1` rooms are all busy at time `s`. Those `k − 1` meetings started at or before `s` (we process in start order) and end after `s`. Together with the new one, that's `k` meetings overlapping at time `s`. **Any** plan needs `k` rooms then. So our count can never be more than necessary.

## The optimal approach

1. Sort meetings by start time.
2. Keep a min-heap `ends`: the end time of the meeting currently in each room.
3. For each meeting `[start, end]`:
   - if `ends` is not empty and `ends.top() ≤ start`, pop it: that room is free and this meeting takes it;
   - push `end`.
4. Return the size of `ends`.

The subtle detail is **`≤`, not `<`**. A meeting ending at 10 frees its room for one starting at 10. With `<`, `[[1, 5], [5, 10]]` would wrongly need 2 rooms.

Notice we pop **at most one** room per meeting, even if several rooms have freed up. That's fine. The meeting needs only one room, and the other free rooms stay in the heap and get reused later. The heap's size never shrinks, so its final size is the most rooms ever open at once.

{{code}}

## Dry run

`intervals = [[0, 30], [5, 10], [15, 20]]` (already sorted by start)

| Meeting | Heap top | top ≤ start? | Action | Heap after | Rooms |
|---|---|---|---|---|---|
| `[0, 30]` | — | heap empty | push 30 | `{30}` | 1 |
| `[5, 10]` | 30 | 30 ≤ 5? no | push 10 (new room) | `{10, 30}` | 2 |
| `[15, 20]` | 10 | 10 ≤ 15? yes | pop 10, push 20 | `{20, 30}` | 2 |

Answer: **2**.

## Complexity

- **Time: O(n log n).** Sorting is O(n log n). Then each meeting does at most one pop and one push on a heap of size at most `n`.
- **Space: O(n).** The heap can hold one end time per meeting, when they all overlap. (Sorting may also take O(log n) to O(n) extra, depending on the language.)

## Edge cases and traps

- **Touching meetings.** `[[1, 5], [5, 10], [10, 15]]` → 1. Use `≤` when checking whether a room is free.
- **Forgetting to sort.** The receptionist logic only works if meetings arrive in start order. Unsorted, you might hand out a room that a *later-starting* meeting has already ended.
- **Sorting by end time.** That's the right sort for "how many meetings can one person attend?", but not here. Sort by start.
- **Identical meetings.** `[[1, 10], [1, 10], [1, 10]]` → 3. Each one finds the top (10) greater than 1 and opens a room.
- **JavaScript has no heap.** The solution carries a small `MinHeap` class. Java's `PriorityQueue` and Python's `heapq` are min-heaps already; C++ needs `greater<int>`.

## Say it in the interview

> "I'll process meetings in order of start time, like a receptionist assigning rooms. For each new meeting I look at the room that frees up earliest, using a min-heap of end times. If that end time is at most the new start, the room is free, so I pop it and reuse it. Otherwise every room is busy and I open a new one. Either way I push the new end time. When I open room k, k meetings overlap at that moment, so no plan can use fewer rooms. Sorting plus heap operations gives O(n log n) time and O(n) space."

## Follow-ups interviewers ask

- **"Can you do it without a heap?"** Yes: the sweep line. Sort all starts and all ends into two separate arrays. Walk the starts. Whenever the next start is `≥` the earliest unused end, a room frees up (advance the end pointer); otherwise you need one more room. Still O(n log n) because of the sorts.
- **"Can one person attend all meetings (Meeting Rooms I)?"** Sort by start and check that each meeting starts at or after the previous one ends.
- **"Tell me which room each meeting gets."** Store `(end, roomId)` pairs in the heap. When you reuse a room, the new meeting inherits its `roomId`; when you open a room, assign the next id.
