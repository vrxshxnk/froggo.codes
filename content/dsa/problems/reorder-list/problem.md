---
id: lc-143
title: Reorder List
pattern: Split, reverse, merge
timeBox: 25
summary: Rearrange a linked list in place so it alternates first, last, second, second-to-last, and so on.
hints:
  - "Write the answer for `1 → 2 → 3 → 4 → 5 → 6`. It's `1 → 6 → 2 → 5 → 3 → 4`. Look at the second half of the list: in what order do its nodes appear in the answer?"
  - "The second half appears backwards. If you had the second half already reversed, the answer would just be the two halves zipped together, one node from each."
  - "Three steps you already know: find the middle with fast and slow pointers, reverse the second half, then merge the two halves by alternating nodes. Cut the list at the middle so the halves are separate."
insight: "The answer is the first half zipped with the reversed second half. So: find the middle (fast/slow), cut, reverse the second half, then weave the two halves together one node at a time."
time: O(n)
space: O(1)
related: [lc-206, lc-141, lc-21]
---

## The problem in plain English

You get the head of a linked list `L0 → L1 → L2 → … → Ln`. Rearrange it into `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …`: first node, last node, second node, second-to-last, and so on until they meet in the middle.

You must **relink the nodes**, not change the values inside them. The function returns nothing; it changes the list in place. The list has between 1 and 50,000 nodes.

Examples:
- `1 → 2 → 3 → 4` → `1 → 4 → 2 → 3`
- `1 → 2 → 3 → 4 → 5` → `1 → 5 → 2 → 4 → 3`

## Start with brute force

The pain is that a singly linked list can't walk backwards, and you keep needing "the last node". So copy every node into an array. Now `nodes[i]` and `nodes[j]` give you any node instantly. Use two indices `i = 0` and `j = n − 1`, link `nodes[i] → nodes[j] → nodes[i + 1]`, move both inwards, and set the final node's `next` to `null`.

That's O(n) time, and honestly fine for an interview. But it uses O(n) extra space, and the follow-up will be "do it in O(1) space".

Doing it with no array at all, by walking to the current last node each time, is O(n²): 50,000 nodes means over a billion steps.

## Building the intuition

Write out a bigger answer and stare at it:

```text
input:   1 → 2 → 3 → 4 → 5 → 6
answer:  1 → 6 → 2 → 5 → 3 → 4
```

Split the answer into the nodes at odd positions and the nodes at even positions:

- odd positions: `1, 2, 3`. That's the **first half**, in order.
- even positions: `6, 5, 4`. That's the **second half, backwards**.

So the answer is just two lists zipped together: the first half, and the reversed second half. And each piece is something you already know how to do:

1. **Find the middle.** Fast and slow pointers: when `fast` reaches the end, `slow` is in the middle.
2. **Reverse the second half.** The same three moves as *Reverse Linked List*: save, flip, step.
3. **Zip the halves.** Like *Merge Two Sorted Lists*, but you alternate instead of comparing.

This is why the problem shows up in interviews. It's three small tools glued together, and the interviewer wants to see you break it down.

## The optimal approach

1. **Find the end of the first half.** Start `slow` and `fast` at `head`. While `fast.next` and `fast.next.next` exist, move `slow` one step and `fast` two. `slow` stops on the last node of the first half.
2. **Cut and reverse.** Set `second = slow.next`, then `slow.next = null` so the first half ends cleanly. Reverse the list starting at `second`.
3. **Zip.** With `first = head` and `second` = head of the reversed half, while `second` exists: save both `next` nodes, link `first → second → (old first.next)`, then move both pointers to their saved nexts.

The subtle detail is **where the middle lands**. With this loop condition, the first half gets the extra node when the length is odd (`1 2 3 | 4 5`), and the halves are equal when it's even (`1 2 | 3 4`). So the second half is never longer, and looping "while `second` exists" is enough. The middle node of an odd list ends up last, which is exactly where it belongs.

{{code}}

## Dry run

`head = 1 → 2 → 3 → 4 → 5`.

**Step 1, find the middle:**

| `slow` | `fast` | Can `fast` take 2 more steps? |
|---|---|---|
| 1 | 1 | yes |
| 2 | 3 | yes |
| 3 | 5 | no, stop |

**Step 2, cut after 3 and reverse:** first half `1 → 2 → 3`, second half `4 → 5` becomes `5 → 4`.

**Step 3, zip.** "List from head" is what you'd see walking from `head`.

| Iteration | `first` | `second` | Links made | List from head | Left in `second` |
|---|---|---|---|---|---|
| 1 | 1 | 5 | `1 → 5`, `5 → 2` | `1 → 5 → 2 → 3` | `4` |
| 2 | 2 | 4 | `2 → 4`, `4 → 3` | `1 → 5 → 2 → 4 → 3` | empty |

`second` is `null`, so we stop. `3.next` is already `null` from the cut, so the list ends correctly.

## Complexity

- **Time: O(n).** Finding the middle is about n/2 steps, reversing is n/2, and zipping is n/2.
- **Space: O(1).** A handful of pointers. Nothing grows with the list.

## Edge cases and traps

- **Forgetting the cut (`slow.next = null`).** The first half still runs into the second half, and you build a cycle. Tests then time out instead of failing cleanly.
- **One or two nodes.** `fast.next.next` doesn't exist, so `slow` stays on `head`. The second half has zero or one node, and the zip does nothing or one harmless link.
- **Saving only one `next` during the zip.** You change both `first.next` and `second.next`, so save both before you touch either.
- **Swapping values instead of nodes.** The problem asks you to relink nodes. Changing `val` fields is not allowed.
- **Returning the head.** The function returns nothing (`void`). Edit the list in place.

## Say it in the interview

> "If I look at the answer, the odd positions are the first half in order and the even positions are the second half reversed. So I'll do it in three steps. Fast and slow pointers to find the middle, then cut the list there. Reverse the second half in place. Then zip the two halves, taking one node from each, saving both nexts before I relink. Each step is O(n) and uses O(1) extra space, so overall O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"Could you just use a stack or array?"** Yes: push all nodes, then pair the front with the back. It's simpler but O(n) space, which is why the three-step version is the expected answer.
- **"How would you test it?"** Lengths 1, 2, 3, 4 and 5 cover every way the middle can land. Then walk the result and check that it ends in `null` (no accidental cycle).
- **"Check if a list is a palindrome in O(1) space."** Same first two steps: find the middle, reverse the second half, then compare the halves node by node instead of zipping.
