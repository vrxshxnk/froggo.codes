---
module: two-pointers-window
title: Two Pointers & Sliding Window
readTime: 9
summary: Two indices that only move one way can replace a pair of nested loops. Learn the three families (pointers from both ends, the fixed-size window and the variable window) and the one question each step answers, and O(n²) problems become single passes.
---

## Why this stage matters

The slow idea this stage replaces is **"try every pair"** or **"try every subarray"**. That means two nested loops, O(n²). It's 5·10⁹ steps when n = 10⁵.

Both brute forces waste work. When the outer loop moves from `i` to `i + 1`, the inner loop starts over and re-checks things it already knew. The fix in this stage is to keep **two indices that only ever move forward** (or only inwards). Every step either settles a candidate for good or reuses what the last step learned. Two pointers moving at most n steps each is O(n).

## The core idea

**Two pointers from both ends:** think of two people searching a sorted bookshelf, one starting at each end. After every comparison, one of them can say, "nothing at my end can be the answer", and step inwards. The shelf shrinks from both sides.

**Sliding window:** think of a train window. As the train moves, one bit of scenery appears on the right and one disappears on the left. You don't repaint the whole view, you just update the edges.

The precise version: each step, you need a **reason** a pointer can move without ever coming back. For opposite-end pointers, the reason is "this end can't be in any answer". For windows, it's an **invariant**, a rule that's true about the window between steps, like "no repeated characters" or "sum ≤ t".

## The templates

### 1. Opposite-end pointers

*Valid Palindrome*, *Two Sum II*, *3Sum*, *Container With Most Water*.

Use it when the input is **sorted**, or the question pairs the two ends (palindromes, widths). You start wide, and every step discards one end.

```python
left, right = 0, len(a) - 1
while left < right:
    if found(a[left], a[right]):
        return ...
    if left_end_is_useless(a[left], a[right]):   # e.g. sum too small
        left += 1
    else:                                         # e.g. sum too big
        right -= 1
```

The proof you should be able to say out loud: "the end I'm dropping can't do better with any partner still between the pointers."

### 2. The fixed-size window

*Permutation in String*, and any problem saying "every block of length k".

The window is always exactly `k` long. Each step adds the new element on the right and removes the one that fell off the left.

```python
for right in range(len(a)):
    add(a[right])
    if right >= k:
        remove(a[right - k])        # it just left the window
    if right >= k - 1:
        check_window()              # window is a[right-k+1 .. right]
```

Keep the window's summary (a sum, a count array) up to date in O(1) per step. Never recompute it.

### 3. The variable window

*Longest Substring Without Repeating Characters*, *Longest Repeating Character Replacement*, *Books*, *Minimum Size Subarray Sum*, and, in disguise, *Best Time to Buy and Sell Stock*.

The right edge grows one step at a time. The left edge moves forward **while the invariant is broken**. Then the window is valid again, and you score it.

```python
left = 0
for right in range(len(a)):
    add(a[right])
    while invariant_broken():
        remove(a[left])
        left += 1
    best = max(best, right - left + 1)   # the window is valid here
```

This only works when **shrinking a valid window keeps it valid**. No repeats stays no repeats, and with positive numbers, sum ≤ t stays sum ≤ t. If shrinking could break things (negative numbers, say), the template doesn't apply.

**The mirror twist for "shortest":** when you want the *shortest* valid window (*Minimum Size Subarray Sum*), flip it. Shrink **while the window is valid**, and record inside the loop:

```python
    while window_is_valid():
        best = min(best, right - left + 1)
        remove(a[left])
        left += 1
```

**Best Time to Buy and Sell Stock** is this family with a shortcut. The window is `[buy day, sell day]`. Track the best buy so far, and when today is cheaper than it, the left edge jumps straight to today, because nothing in between was cheaper. You don't need a `while` loop, just one variable.

### Why the nested loop is still O(n)

The `while` inside the `for` looks like O(n²), but `left` only moves forward and never passes `right`. Over the whole run it moves at most n times. Total work: n moves of `right` + n moves of `left` = O(n). Say this in the interview, because it's the question they'll ask.

## How to recognise this pattern

- **Sorted array plus a pair or triple** with a target sum → opposite-end pointers.
- "**palindrome**", "compare from both ends", "maximise width × height" → opposite-end pointers.
- "**contiguous** subarray / substring", "consecutive", "block" → a window.
- "every block / window **of length k**", "anagram / permutation **inside** a string" → fixed window.
- "**longest** / **shortest** substring or subarray **such that** …" → variable window. The "such that" is your invariant.
- "at most k changes / distinct / zeros" → variable window with a budget.
- The values are **positive**, so sums move in one direction as the window grows → the window is safe.

## The mistakes everyone makes

1. **Moving the wrong pointer.** In *Container With Most Water*, move the *shorter* wall. In *Two Sum II*, a sum that's too small moves `left`. Always know *why* the end you drop is useless.
2. **`if` where you need `while`.** Shrinking by one step isn't always enough to restore the invariant.
3. **Recording the answer at the wrong moment.** For the longest window, record after shrinking. For the shortest, record inside the shrink loop.
4. **Off-by-one window length.** It's `right − left + 1` for a window, but `right − left` for the *distance* between two walls.
5. **Using a window on negative numbers.** If shrinking can raise the sum, the invariant breaks. Use prefix sums (see *Subarray Sum Equals K*) instead.
6. **Forgetting duplicates after sorting.** In *3Sum*, skip equal neighbours, or you'll list the same triplet twice.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Valid Palindrome | Opposite-end pointers, skipping junk in place |
| Two Sum II - Input Array Is Sorted | Why a sorted array lets you drop one end each step |
| 3Sum | Fix one number, then run Two Sum II; skip duplicates |
| Container With Most Water | Drop the end that caps the answer |
| Best Time to Buy and Sell Stock | Track the best buy so far: a window whose left edge jumps |
| Longest Substring Without Repeating Characters | The variable window template with a set |
| Longest Repeating Character Replacement | A window with a budget: length − most common ≤ k |
| Permutation in String | The fixed-size window with letter counts |
| Books (Codeforces) | Longest window with sum ≤ t, at full contest scale |
| Minimum Size Subarray Sum | The shortest-window twist: shrink while still valid |

Try each problem for its time box before opening the walkthrough. Before writing any code, say the invariant out loud ("the window has no repeats", "the sum is at most t"). Once you can state it, the code nearly writes itself.
