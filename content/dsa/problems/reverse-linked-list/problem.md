---
id: lc-206
title: Reverse Linked List
pattern: Iterative pointer reversal
timeBox: 15
summary: Given the head of a singly linked list, flip every arrow so the list runs backwards, and return the new head.
hints:
  - "You don't need to move any values or build a new list. Every node already exists; only the direction of each `next` arrow is wrong."
  - "If you point `curr.next` backwards, you lose your only way to reach the rest of the list. Save it in a variable before you flip."
  - "Keep two pointers: `prev` (the head of the part you've already reversed, starting at null) and `curr`. Each step: save `curr.next`, point `curr.next` at `prev`, then move both pointers one node forward."
insight: "Walk the list once with `prev` and `curr`. At each node: save the next node, flip the arrow to point back at `prev`, then step both forward. When `curr` falls off the end, `prev` is the new head."
time: O(n)
space: O(1)
related: [lc-143, lc-21, lc-2]
---

## The problem in plain English

You get `head`, the first node of a **singly linked list**: a chain of nodes where each node holds a value `val` and one arrow `next` pointing to the node after it. The last node's `next` is `null`.

Reverse the list and return the new first node. The list can be empty (`head` is `null`) and has at most 5,000 nodes.

Example: `1 → 2 → 3 → 4 → 5` becomes `5 → 4 → 3 → 2 → 1`, and you return the node holding `5`.

## Start with brute force

Copy every value into an array, then walk the list again and write the values back in reverse order. Or push every node onto a stack and pop them off, relinking as you go.

Both are correct and O(n) time. Both also use O(n) extra memory for the array or stack. An interviewer will accept it as a first step, then ask: "Can you do it with O(1) extra space?" That's the real question.

## Building the intuition

Draw the list on paper as boxes and arrows:

```text
null    1 → 2 → 3 → null
```

What does the answer look like? `null ← 1 ← 2 ← 3`. Same boxes, same places. **Only the arrows changed direction.** So you don't need new nodes. You need to visit each node once and turn its arrow around.

Try it on node `1`. Its arrow should point at whatever came before it. Nothing came before it, so it should point at `null`. Write `1.next = null`.

Now you're stuck. That arrow was your only way to reach `2`. You just cut the rope you were climbing.

That tells you two things:

1. **Before you flip an arrow, save where it pointed.** Call it `nxt`.
2. **You need to remember the node behind you**, because that's what the flipped arrow should point at. Call it `prev`. For node `1`, `prev` is `null`.

Now each step is the same three moves: **save, flip, step.** Repeat until you run out of nodes.

## The optimal approach

1. Set `prev = null` and `curr = head`. `prev` is the head of the reversed part, which starts empty.
2. While `curr` isn't `null`:
   1. **Save:** `nxt = curr.next`.
   2. **Flip:** `curr.next = prev`.
   3. **Step:** `prev = curr`, then `curr = nxt`.
3. Return `prev`.

The subtle detail is **what you return**. The loop ends when `curr` is `null`, one step past the old last node. The old last node is in `prev`, and it's the new head. Returning `head` is a classic bug: `head` is now the *tail*, and you'd return a one-node list.

The order inside the loop matters too. `prev = curr` must come before `curr = nxt`. Swap them, and `prev` ends up pointing at the wrong node.

{{code}}

## Dry run

`head = 1 → 2 → 3`. The "list state" column shows every arrow after that step.

| Step | `nxt` saved | Flip | `prev` after | `curr` after | List state |
|---|---|---|---|---|---|
| start | – | – | `null` | `1` | `1 → 2 → 3 → null` |
| 1 | `2` | `1.next = null` | `1` | `2` | `null ← 1` and `2 → 3 → null` |
| 2 | `3` | `2.next = 1` | `2` | `3` | `null ← 1 ← 2` and `3 → null` |
| 3 | `null` | `3.next = 2` | `3` | `null` | `null ← 1 ← 2 ← 3` |

`curr` is `null`, so the loop stops. Return `prev`, the node `3`: the list reads `3 → 2 → 1`.

Notice that in the middle of the loop the list is in two pieces: the reversed part starting at `prev`, and the untouched part starting at `curr`. `nxt` is the thread that keeps the second piece reachable.

## Complexity

- **Time: O(n).** Each node is visited once, and each visit does three pointer assignments.
- **Space: O(1).** Three pointer variables, however long the list is.

## Edge cases and traps

- **Empty list.** `curr` starts as `null`, the loop never runs, and you return `prev = null`. Correct, with no special case.
- **One node.** One loop iteration sets its `next` to `null` and returns it.
- **Returning `head`.** After the loop, `head` is the last node. Return `prev`.
- **Flipping before saving.** `curr.next = prev` first loses the rest of the list forever.
- **Wrong step order.** `curr = nxt` then `prev = curr` makes `prev` and `curr` the same node.

## Say it in the interview

> "I don't need new nodes; I just need to flip every `next` pointer. I'll keep `prev`, the head of the reversed part, starting at null, and `curr`. At each node I save `curr.next`, point `curr.next` back at `prev`, then move `prev` and `curr` forward one step. When `curr` becomes null, `prev` is the new head. That's O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"Can you do it recursively?"** Reverse the rest first (`newHead = reverseList(head.next)`), then set `head.next.next = head` and `head.next = null`, and return `newHead`. It's O(n) time but O(n) stack space, and 5,000 levels can be risky in some languages.
- **"Reverse only positions `left` to `right`."** That's *Reverse Linked List II*. Walk to the node before `left` (a dummy head handles `left = 1`), reverse that stretch with the same three moves, then reconnect both ends.
- **"Where else is this used?"** Constantly. *Reorder List* later in this stage reverses the second half of a list as one of its steps.
