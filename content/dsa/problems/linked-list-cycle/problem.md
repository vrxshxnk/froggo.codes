---
id: lc-141
title: Linked List Cycle
pattern: Fast and slow pointers
timeBox: 15
summary: Given the head of a linked list, decide whether following the next pointers ever loops back to a node you've already visited.
hints:
  - "If there's no loop, walking the list eventually hits null. If there is one, you walk forever. The hard part is telling 'forever' apart from 'just a long list'."
  - "A hash set of visited nodes works in O(n) space. To do it in O(1), think about two runners on a circular track, one faster than the other."
  - "Move one pointer one step at a time and another two steps at a time. If the fast one reaches null, there's no cycle. If there is a cycle, the fast one must eventually land on the same node as the slow one."
insight: "Run a slow pointer (1 step) and a fast pointer (2 steps). With no cycle, fast hits null. With a cycle, both end up going round the loop, fast closes the gap by one node per step, and they must meet."
time: O(n)
space: O(1)
related: [lc-143, lc-19, lc-206]
---

## The problem in plain English

You get `head`, the first node of a linked list. Normally the last node's `next` is `null`. But here the last node might instead point back to some earlier node, which creates a **cycle** (a loop). Return `true` if there's a cycle and `false` otherwise.

LeetCode describes the input with a number `pos`: the index the tail links back to, or `-1` for no cycle. Your function never sees `pos`. It only gets `head`. The list has up to 10,000 nodes.

Example: values `3 → 2 → 0 → -4` where `-4` links back to `2` (`pos = 1`) → `true`.

## Start with brute force

Walk the list and put every node you visit into a hash set. Before adding a node, check if it's already there. If it is, you've come back round: cycle. If you reach `null`, no cycle.

Store the **nodes themselves** (their identity), not their values. Two different nodes can both hold the value `1`.

This is O(n) time and O(n) space. It's a fine first answer. The follow-up is always: "Can you do it with O(1) memory?"

## Building the intuition

Without extra memory you can't remember where you've been. So you need some other way to notice "I'm going round in circles."

Think of two friends running on a track. If the track is a straight road with an end, the faster friend just reaches the end first. But if the track is a loop, the faster friend keeps going round and eventually **comes up behind the slower friend and passes them**. That moment of being in the same place is your proof of a loop.

Turn that into pointers. `slow` moves one node per step. `fast` moves two.

- **No cycle:** `fast` reaches `null` (or a node whose `next` is `null`) first. Answer `false`.
- **Cycle:** both pointers eventually enter the loop and go round forever. Once they're both in it, measure how far `fast` is behind `slow`, going forward round the loop. Each step `slow` adds 1 to that distance and `fast` takes away 2, so the gap **shrinks by exactly 1 per step**. A gap that shrinks by 1 can't jump over 0. They will land on the same node within one lap.

## The optimal approach

1. Start `slow` and `fast` at `head`.
2. While `fast` and `fast.next` both exist:
   - `slow = slow.next`
   - `fast = fast.next.next`
   - If `slow` and `fast` are the **same node**, return `true`.
3. If the loop exits, `fast` hit the end. Return `false`.

The subtle detail is the **loop condition**. `fast` jumps two nodes, so before the jump you need `fast` to exist *and* `fast.next` to exist. Checking only `fast` crashes on `fast.next.next` when the list has an even length. You never need to check `slow`: it's always behind `fast`, so if `fast` is safe, `slow` is too.

Also check for a meeting *after* moving, not before. At the start both are on `head`, so checking first would always say `true`.

{{code}}

## Dry run

Values `3 → 2 → 0 → -4`, and `-4` links back to `2`. Call the nodes A(3), B(2), C(0), D(-4). The list state never changes here; we only move pointers.

| Step | `slow` | `fast` | Same node? |
|---|---|---|---|
| start | A (3) | A (3) | not checked |
| 1 | B (2) | C (0) | no |
| 2 | C (0) | B (2): C → D → B | no |
| 3 | D (-4) | D (-4): B → C → D | **yes** → `true` |

Now the no-cycle case `1 → 2 → 3`: after step 1, `slow` is on 2 and `fast` is on 3. `fast.next` is `null`, so the loop stops and we return `false`.

## Complexity

- **Time: O(n).** With no cycle, `fast` reaches the end in about n/2 steps. With a cycle, `slow` gets into the loop within n steps, and then they meet within one more lap, which is at most n steps.
- **Space: O(1).** Two pointers.

## Edge cases and traps

- **Empty list or one node with no loop.** `fast` or `fast.next` is `null` straight away, so return `false`.
- **One node pointing at itself.** Step 1: `slow` and `fast` both land on that node. Return `true`.
- **Comparing values instead of nodes.** `slow.val == fast.val` gives `true` for `1 → 1` with no cycle. Compare the references (`is` in Python, `==` on pointers or objects elsewhere).
- **Checking only `fast`.** Crashes on `fast.next.next` when `fast.next` is `null`.
- **Checking for a meeting before moving.** Both start on `head`, so you'd always return `true`.

## Say it in the interview

> "A hash set of visited nodes works but costs O(n) space. Instead I'll use Floyd's fast and slow pointers. Slow moves one step, fast moves two. If there's no cycle, fast reaches null. If there is one, both end up in the loop, and the gap between them shrinks by one node each step, so they have to meet. I compare node references, not values. That's O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"Where does the cycle start?"** That's *Linked List Cycle II*. After they meet, move one pointer back to `head` and step both one node at a time. They meet again exactly at the start of the loop.
- **"How long is the cycle?"** After they meet, keep `fast` still and walk `slow` round until it comes back, counting steps.
- **"Why speed 2? Why not 3?"** Speed 2 makes the gap shrink by exactly 1, so they can't skip past each other. With other speeds they still meet eventually, but the argument is messier and you gain nothing.
