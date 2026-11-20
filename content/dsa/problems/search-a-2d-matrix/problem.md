---
id: lc-74
title: Search a 2D Matrix
pattern: Flatten the grid, then lower bound
timeBox: 25
summary: Decide whether a target appears in a grid whose rows are sorted and where each row starts after the previous row ends, in O(log(m·n)) time.
hints:
  - "Read the matrix row by row, left to right, as if it were one long list. What do you notice about that list?"
  - "That list is fully sorted. You don't need to build it: position i in the long list is row i / n, column i % n, where n is the number of columns."
  - "Binary search positions 0 to m·n for the first one whose value is >= target, reading each value through (i / n, i % n). Then check whether that position exists and holds the target."
insight: Because each row starts after the previous one ends, reading the grid row by row gives one sorted list of m·n numbers. Binary search that imaginary list, converting each position to (row, column) with division and remainder.
time: O(log(m·n))
space: O(1)
related: [lc-704, lc-34, lc-153]
---

## The problem in plain English

You get an `m × n` grid of integers (`m` rows, `n` columns) with two promises:

1. Each row is sorted from left to right.
2. The first number of each row is bigger than the last number of the row above.

Return `true` if `target` is somewhere in the grid and `false` otherwise. Your solution must run in O(log(m·n)) time. Both `m` and `n` are at most 100.

Example:

```text
 1   3   5   7
10  11  16  20
23  30  34  60
```

With `target = 3` the answer is `true`. With `target = 13` it's `false`: 13 would sit between 11 and 16, and it isn't there.

## Start with brute force

Check every cell. That's O(m·n): 10⁴ checks for a 100 × 100 grid. It ignores both promises.

A smarter version scans down the first column to find the row that could hold the target, then scans that row. That's O(m + n), about 200 checks. Better, but still a scan, and the problem asks for logarithmic time.

## Building the intuition

Read the example the way you read a page of text: left to right, then down to the next line.

```text
1 3 5 7 10 11 16 20 23 30 34 60
```

That's one sorted list. Promise 1 keeps each row in order, and promise 2 makes each row continue where the last one stopped. So this "2D" problem is secretly *Binary Search* on a list of `m·n = 12` numbers.

You don't want to copy the grid into a list, because that costs O(m·n) time and memory and defeats the point. So ask: **if I'm at position `i` in that long list, which cell is it?**

Every row holds `n = 4` numbers. Position 6 comes after one full row (positions 0–3) and lands 2 steps into the next. That's row `6 / 4 = 1`, column `6 % 4 = 2`, and indeed `matrix[1][2] = 16`. In general:

- `row = i / n` (integer division: how many full rows come before `i`)
- `col = i % n` (the remainder: how far into that row)

Now run the usual lower-bound search on positions `0` to `m·n`, reading each value through that conversion.

## The optimal approach

1. Let `m` be the number of rows, `n` the number of columns, and `total = m·n`.
2. Set `lo = 0` and `hi = total`. Position `total` is past the end and counts as true.
3. While `lo < hi`:
   - `mid = lo + (hi - lo) // 2`, and its value is `matrix[mid / n][mid % n]`.
   - If that value is `>= target`, set `hi = mid`. Otherwise set `lo = mid + 1`.
4. `lo` is the first position whose value is at least `target`. Return `true` if `lo < total` and that cell equals `target`.

**The subtle detail: divide by the number of columns, not rows.** `n` is the length of one row, and that's what tells you how many positions to skip per row. With a square grid both work, so the bug hides until a test like a 1 × 5 grid comes along.

{{code}}

## Dry run

The example grid, so `m = 3`, `n = 4` and `total = 12`. Target `3`:

| lo | mid | hi | cell (mid / 4, mid % 4) | value | value >= 3? | update |
|---|---|---|---|---|---|---|
| 0 | 6 | 12 | (1, 2) | 16 | Yes | `hi = 6` |
| 0 | 3 | 6 | (0, 3) | 7 | Yes | `hi = 3` |
| 0 | 1 | 3 | (0, 1) | 3 | Yes | `hi = 1` |
| 0 | 0 | 1 | (0, 0) | 1 | No | `lo = 1` |
| 1 | | 1 | | | | stop |

Position 1 is cell (0, 1), which holds 3. Return `true`.

Target `13`:

| lo | mid | hi | cell | value | value >= 13? | update |
|---|---|---|---|---|---|---|
| 0 | 6 | 12 | (1, 2) | 16 | Yes | `hi = 6` |
| 0 | 3 | 6 | (0, 3) | 7 | No | `lo = 4` |
| 4 | 5 | 6 | (1, 1) | 11 | No | `lo = 6` |
| 6 | | 6 | | | | stop |

Position 6 is cell (1, 2), which holds 16, not 13. Return `false`.

## Complexity

- **Time: O(log(m·n)).** It's binary search over `m·n` positions. For a 100 × 100 grid that's about 14 steps. Each step does one division and one remainder, both O(1).
- **Space: O(1).** The flat list is imaginary; we only store `lo`, `hi` and `mid`.

## Edge cases and traps

- **Using `m` instead of `n` in `mid / n` and `mid % n`.** Passes square tests and fails on rectangles. Test a single row and a single column.
- **Target bigger than everything.** The search ends at `lo = total`. Check `lo < total` before you convert it to a cell, or you'll read row `m`, which doesn't exist.
- **One cell.** `total = 1`: one step and the check. No special case needed.
- **Two separate searches (row first, then column).** That's also O(log m + log n) = O(log(m·n)) and fine. But it's two loops with two sets of boundaries to get right, and it's easy to pick the wrong row when the target is smaller than a row's first element.

## Say it in the interview

> "Because each row is sorted and starts after the previous row ends, reading the grid row by row gives a single sorted list of m times n numbers. I don't build that list. Position i maps to row i divided by n and column i mod n, where n is the number of columns. I binary search positions 0 to m times n for the first value that's at least the target, then check that it's in bounds and equal to the target. That's O(log of m times n) time and O(1) space."

## Follow-ups interviewers ask

- **"What if rows are sorted and columns are sorted, but a row doesn't start after the previous one ends?"** That's *Search a 2D Matrix II*. The flat list is no longer sorted. Start at the top-right corner: if the value is too big, move left; if it's too small, move down. Each step removes a row or a column, so it's O(m + n).
- **"What if m·n doesn't fit in a 32-bit int?"** Use 64-bit `lo`, `hi` and `mid`. Here m·n is at most 10⁴, so `int` is fine.
- **"Return the cell instead of true/false?"** Return `[lo / n, lo % n]` after the same check.
