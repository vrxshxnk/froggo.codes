---
id: lc-19
title: Remove Nth Node From End of List
pattern: Two pointers with a fixed gap
timeBox: 25
summary: Delete the node that is n places from the end of a linked list, and return the head of the result.
hints:
  - "Counting from the end is easy if you know the length L: the nth node from the end is node number L − n from the front (0-indexed). That's two passes. Can you do it in one?"
  - "To delete a node in a singly linked list, you need the node just before it. And deleting the very first node is a special case, unless you add a fake node in front of head."
  - "Start two pointers at a dummy node in front of head. Move `fast` n steps ahead. Then move both together until `fast` is on the last node. Because the gap stays n, `slow` is now just before the node to delete."
insight: "Put a dummy node before head and start two pointers there. Push `fast` n nodes ahead, then move both until `fast` is on the last node. The fixed gap leaves `slow` just before the target, so `slow.next = slow.next.next` deletes it."
time: O(n)
space: O(1)
related: [lc-141, lc-143, lc-21]
---

## The problem in plain English

You get the head of a linked list and a number `n`. Remove the node that is `n`-th from the **end** (`n = 1` is the last node) and return the head of the changed list.

`n` is always valid: the list has between 1 and 30 nodes, and `1 ≤ n ≤ length`. That means `n` can equal the length, which means **deleting the head**.

Example: `1 → 2 → 3 → 4 → 5`, `n = 2` → `1 → 2 → 3 → 5`. The 2nd node from the end is `4`.

## Start with brute force

Two passes. First, walk the whole list to count its length `L`. The node to delete is then `L − n` steps from the front (0-indexed), so walk `L − n − 1` steps to reach the node *before* it and unlink it. If `L − n` is `0`, you're deleting the head, so return `head.next` instead.

That's already O(n) time and O(1) space, so it's a perfectly good answer. Interviewers usually follow with "can you do it in **one** pass?" The one-pass version also teaches a trick you'll reuse.

## Building the intuition

The trouble is "from the end". When you're walking a singly linked list, you have no idea how close the end is until you fall off it.

So use a second pointer as a **measuring stick**. Picture two people walking down a corridor holding a rope of fixed length between them. When the person in front touches the far wall, the person behind is exactly one rope-length from the wall.

In pointer terms: if `fast` is exactly `n` nodes ahead of `slow`, then when `fast` is on the last node, `slow` is `n` nodes before the last node. That's the node **just before** the one we want to delete. And "just before" is exactly what deleting needs, because to unlink a node you change the `next` of the node in front of it.

One problem left: if the target is the head, there's no node in front of it. So **make one**. A dummy node placed before `head` means every real node, including the head, has a node before it. Start both pointers on the dummy.

## The optimal approach

1. Create `dummy` with `dummy.next = head`. Set `slow = fast = dummy`.
2. Move `fast` forward `n` times. Now there are exactly `n` steps between them.
3. While `fast.next` isn't `null`, move both one step. When this stops, `fast` is on the last node.
4. `slow.next` is the target. Unlink it: `slow.next = slow.next.next`.
5. Return `dummy.next`.

The subtle detail is **why return `dummy.next` and not `head`**. If the target was the head, step 4 makes `dummy.next` point at the second node. `head` still points at the deleted node. `dummy.next` is always the true first node.

{{code}}

## Dry run

`1 → 2 → 3 → 4 → 5`, `n = 2`. `D` is the dummy, so the list is `D → 1 → 2 → 3 → 4 → 5`.

| Step | `slow` | `fast` | Note |
|---|---|---|---|
| start | D | D | |
| gap 1 | D | 1 | |
| gap 2 | D | 2 | gap is now n = 2 |
| slide | 1 | 3 | |
| slide | 2 | 4 | |
| slide | 3 | 5 | `fast.next` is `null`, stop |

`slow` is on `3`, so `slow.next` is `4`, the target. Set `3.next = 5`. List state: `D → 1 → 2 → 3 → 5`. Return `dummy.next`, which is `1`.

Now `n = 5` on the same list: `fast` takes 5 steps to reach `5`, which is already the last node, so the slide loop never runs. `slow` is still on `D`, and `D.next = 2` deletes the head. Return `dummy.next` = `2`. No special case needed.

## Complexity

- **Time: O(n).** `fast` walks the list once; `slow` follows behind it.
- **Space: O(1).** One dummy node and two pointers.

## Edge cases and traps

- **Deleting the head (`n` = length).** Without a dummy you need a special case. With one, `slow` stays on the dummy and it just works.
- **A one-node list, `n = 1`.** `slow` stays on the dummy, `dummy.next` becomes `null`, and you return `null`: an empty list.
- **Off by one in the gap.** If both pointers start on `head` instead of the dummy, `slow` ends *on* the target instead of before it. Draw `D → 1 → 2` and check where `slow` stops before you code it.
- **Looping `while fast` instead of `while fast.next`.** `fast` goes one step too far, so `slow` lands on the target, not before it.
- **Returning `head`.** Wrong when the head was deleted. Return `dummy.next`.

## Say it in the interview

> "I'll do it in one pass with two pointers. I put a dummy node in front of head so deleting the head isn't a special case, and start both pointers there. I move `fast` n steps ahead, then move both together until `fast` is on the last node. Since the gap stays n, `slow` is now just before the node to remove, so I set `slow.next` to `slow.next.next` and return `dummy.next`. That's O(n) time and O(1) space."

## Follow-ups interviewers ask

- **"Is one pass actually faster than two?"** Not in big-O; both are O(n). The one-pass version touches each node with `fast` once and `slow` trails behind, so total pointer moves are similar. What it shows is the fixed-gap technique.
- **"Find the middle of the list in one pass."** A different speed instead of a fixed gap: move `fast` two steps for every one step of `slow`. When `fast` hits the end, `slow` is in the middle.
- **"What if `n` might be larger than the length?"** Check for `null` while opening the gap. If `fast` runs off the list before taking `n` steps, return the list unchanged.
