---
id: lc-36
title: Valid Sudoku
pattern: Hash sets per group
timeBox: 20
summary: Check whether a partly filled 9×9 Sudoku board breaks any rule — no repeated digit in a row, a column, or a 3×3 box.
hints:
  - "You don't need to solve the Sudoku. Only check that the digits already placed don't clash."
  - "Every filled cell belongs to exactly one row, one column, and one 3×3 box. Keep a set of seen digits for each of the 27 groups."
  - "The box for cell (r, c) is number (r // 3) * 3 + (c // 3) — that maps the board onto boxes 0 to 8."
insight: Each cell belongs to one row, one column and one box. Keep 27 'seen' sets (9 each); a digit already in any of its three sets means the board is invalid.
time: O(1) — the board is always 81 cells
space: O(1) — at most 243 entries
related: [lc-217, lc-1]
---

## The problem in plain English

You get a 9×9 board where each cell is a digit `'1'`–`'9'` or `'.'` (empty). Return `true` if the **filled** cells follow Sudoku's three rules:

1. No digit repeats in any **row**.
2. No digit repeats in any **column**.
3. No digit repeats in any of the nine **3×3 boxes**.

You are **not** asked whether the puzzle can be solved — only whether what's on the board is legal right now.

## Start with brute force

Check each rule separately: loop over the 9 rows with a fresh set, then the 9 columns, then the 9 boxes. That's three passes over 81 cells — already fast. The board size is fixed, so any reasonable approach is O(1). The interview is really about **clean indexing**, especially the box number.

## Building the intuition

Instead of three passes, do one: every filled cell `(r, c)` belongs to:

- row `r`
- column `c`
- box `(r // 3) * 3 + (c // 3)`

Keep a set of digits for each row, each column and each box. When you see a digit, check all three of its sets. If it's already in any of them, there's a clash.

**Where does the box formula come from?** `r // 3` tells you which band of three rows you're in (0, 1 or 2), and `c // 3` tells you which stack of three columns (0, 1 or 2). Numbering boxes left to right, top to bottom gives `band × 3 + stack`:

```
 box 0 | box 1 | box 2      rows 0–2
-------+-------+-------
 box 3 | box 4 | box 5      rows 3–5
-------+-------+-------
 box 6 | box 7 | box 8      rows 6–8
```

Cell `(4, 7)`: band `4 // 3 = 1`, stack `7 // 3 = 2` → box `1 × 3 + 2 = 5`. ✓

## The optimal approach

1. Create 9 empty sets for rows, 9 for columns and 9 for boxes.
2. For every cell `(r, c)` holding a digit `d`:
   - compute `b = (r // 3) * 3 + c // 3`
   - if `d` is already in `rows[r]`, `cols[c]` or `boxes[b]`, return `false`
   - otherwise add `d` to all three
3. Return `true`.

{{code}}

## Dry run

On LeetCode's second example, the top-left cell is `'8'` and the cell at `(3, 0)` is also `'8'`.

| cell | digit | row set | col set | box | result |
|---|---|---|---|---|---|
| (0, 0) | 8 | rows[0] gets 8 | cols[0] gets 8 | box 0 gets 8 | ok |
| … | … | … | … | … | ok |
| (3, 0) | 8 | rows[3] fine | **cols[0] already has 8** | box 3 | return `false` |

## Complexity

- **Time: O(1).** The board is always 81 cells. For a general n×n board it's O(n²).
- **Space: O(1).** At most 81 digits stored three times. For n×n it's O(n²).

## Edge cases and traps

- **Empty cells.** Skip `'.'` — don't add it to any set.
- **The box index.** `(r // 3) * 3 + c // 3`, **not** `r // 3 + c // 3` (that collides boxes 1 and 3).
- **Integer division.** In JavaScript, `r / 3` is a decimal — use `Math.floor(r / 3)`.
- **Solving it.** A valid board can still be unsolvable. Don't overthink it.

## Say it in the interview

> "Every filled cell belongs to one row, one column and one box, where the box index is (r / 3) * 3 + c / 3 with integer division. I keep a set of seen digits for each of the 27 groups and do a single pass: if a digit is already in any of its three sets, the board is invalid. The board size is fixed, so it's constant time and space, or O(n²) for an n×n board."

## Follow-ups interviewers ask

- **"Can you use less memory?"** Use a 9-bit mask per group instead of a set: digit `d` sets bit `d`.
- **"Now solve the Sudoku."** That's backtracking (LeetCode 37) — try a digit, recurse, undo on failure. You'll learn backtracking later in the plan.
- **"Generalise to n² × n² boards?"** Same idea, with box index `(r // n) * n + c // n`.
