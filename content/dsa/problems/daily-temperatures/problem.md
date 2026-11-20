---
id: lc-739
title: Daily Temperatures
pattern: Monotonic decreasing stack
timeBox: 25
summary: For each day, find how many days you must wait until a strictly warmer day, or 0 if none comes.
hints:
  - "Turn it around. Instead of each day looking forward for a warmer day, let each new day ask: which earlier days was I the answer for?"
  - "If a day is still waiting and a later day is already colder than it, can that later day ever be the answer for anyone the waiting day isn't? Think about which waiting days stay useful."
  - "Keep a stack of indices still waiting for a warmer day, with temperatures decreasing from bottom to top. For each new day, pop while the top is colder than today and set answer[top] = today − top. Then push today."
insight: When a warm day arrives, it answers every colder day still waiting, and those waiting days are always the most recent ones. A stack of unanswered days, whose temperatures only go down from bottom to top, settles each day exactly once.
time: O(n)
space: O(n)
related: [lc-84, lc-42, lc-155]
---

## The problem in plain English

You get an array `temperatures`, one reading per day. For each day `i`, return how many days you have to wait after day `i` to get a temperature **strictly higher** than `temperatures[i]`. If no warmer day ever comes, the answer for that day is `0`.

There are up to 10⁵ days, and temperatures are between 30 and 100.

Example: `[73, 74, 75, 71, 69, 72, 76, 73]` → `[1, 1, 4, 2, 1, 1, 0, 0]`. The 75° at index 2 waits until the 76° at index 6: 4 days.

## Start with brute force

For each day `i`, scan forward from `i + 1` until you find a warmer day.

It's correct, but think about a steadily cooling month: `[100, 99, 98, …]`. Every day scans to the end and finds nothing. That's about n²/2 steps. For n = 10⁵ that's 5 × 10⁹, far too slow.

## Building the intuition

The brute force makes every day look **forward**. Flip it: walk left to right, and when you reach a new day, ask "**which earlier days have just found their answer?**"

Say you're at 72° and the days still waiting (with no warmer day yet) are 75°, 71°, 69°. Today, 72°, is warmer than 71° and 69°, so both are answered right now. It isn't warmer than 75°, so 75° keeps waiting.

Look at the waiting list more closely. It's always **decreasing**: 75, 71, 69. Why? If a colder day came after a warmer one, it waits behind it. If a warmer day came, it would have answered the colder ones already and removed them. So the waiting days are sorted from warmest (oldest) to coldest (newest).

That means when a new day arrives, the days it answers are always at the **newest end** of the list, and you can stop at the first waiting day that's warmer than today. Take from the newest end, add to the newest end: that's a **stack**.

A stack whose values stay sorted is called a **monotonic stack**. The "pop while worse, then push" loop below is its whole template.

## The optimal approach

1. Create `answer`, all zeros (zero is already right for days that are never answered).
2. Create an empty stack of **indices**. You need indices to compute the wait, and you can always look up the temperature.
3. For each day `i`:
   - While the stack isn't empty and `temperatures[top] < temperatures[i]`: pop `j = top` and set `answer[j] = i − j`.
   - Push `i`.
4. Return `answer`. Whatever is left on the stack never found a warmer day, and those entries are already 0.

The subtle detail is **strictly** warmer: the pop condition is `<`, not `<=`. With `[70, 70]`, the second 70 must not answer the first one. Using `<=` would give `[1, 0]` instead of `[0, 0]`.

{{code}}

## Dry run

`temperatures = [73, 74, 75, 71, 69, 72, 76, 73]`. The stack shows `index(temp)`.

| i | temp | popped (answer set) | stack after |
|---|---|---|---|
| 0 | 73 | none | `0(73)` |
| 1 | 74 | 0 → `ans[0] = 1` | `1(74)` |
| 2 | 75 | 1 → `ans[1] = 1` | `2(75)` |
| 3 | 71 | none (75 isn't colder) | `2(75) 3(71)` |
| 4 | 69 | none | `2(75) 3(71) 4(69)` |
| 5 | 72 | 4 → `ans[4] = 1`, 3 → `ans[3] = 2` | `2(75) 5(72)` |
| 6 | 76 | 5 → `ans[5] = 1`, 2 → `ans[2] = 4` | `6(76)` |
| 7 | 73 | none | `6(76) 7(73)` |

Days 6 and 7 stay on the stack, so they keep 0. Result: `[1, 1, 4, 2, 1, 1, 0, 0]`.

## Complexity

- **Time: O(n).** It looks like a loop inside a loop, but every index is pushed exactly once and popped at most once. That's at most 2n stack operations in total. This "count the pushes and pops" argument is called **amortized analysis**, and every monotonic stack uses it.
- **Space: O(n).** A strictly cooling array keeps every index on the stack.

## Edge cases and traps

- **`<=` instead of `<`.** Equal temperatures are not warmer.
- **Storing temperatures instead of indices.** You need the index to compute `i − j`. Store indices and look up temperatures.
- **Thinking it's O(n²) because of the nested `while`.** Count pops, not loop nesting.
- **One day only.** `[50]` → `[0]`.
- **Using the 30–100 range.** There's an O(n · 71) trick that scans from the right and tracks the next index of each temperature. It's neat, but it only works because the range is tiny. The stack works for any values.

## Say it in the interview

> "Brute force scans forward from every day, which is O(n²) on a cooling streak. Instead I walk left to right and keep a stack of indices still waiting for a warmer day. Their temperatures are decreasing from bottom to top, because a warmer day would have cleared colder ones. For each new day I pop every waiting day that's strictly colder and record the distance, then push today. Each index is pushed and popped at most once, so it's O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"Next greater element in a circular array?"** Loop over the array twice (index `i % n`) with the same stack. Only push during the first pass.
- **"What about the previous warmer day instead of the next?"** Same stack, but read the answer when you push: after popping, the top is the nearest earlier warmer day.
- **"Where else does this show up?"** Stock span, *Largest Rectangle in Histogram* and *Trapping Rain Water*, which all use the same "pop while worse" loop.
