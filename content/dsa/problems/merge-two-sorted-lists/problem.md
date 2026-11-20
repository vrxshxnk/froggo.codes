---
id: lc-21
title: Merge Two Sorted Lists
pattern: Dummy head and tail pointer
timeBox: 15
summary: Given two linked lists that are each sorted, splice their nodes together into one sorted list and return its head.
hints:
  - "Both lists are sorted, so the smallest node overall is always at the front of one of the two lists. Which one? Compare the two fronts."
  - "Build the answer by repeatedly taking the smaller front node and attaching it to the end of your result. Keep a `tail` pointer so attaching is O(1)."
  - "The very first attach is awkward because the result has no nodes yet. Start the result with a fake 'dummy' node, attach everything after it, and return `dummy.next`. When one list runs out, attach the other in one move."
insight: "Keep a dummy node and a `tail` pointer. Repeatedly move the smaller of the two front nodes onto `tail`. When one list empties, hang the rest of the other on the end. Return `dummy.next`."
time: O(n + m)
space: O(1)
related: [lc-23, lc-2, lc-19]
---

## The problem in plain English

You get the heads of two linked lists, `list1` and `list2`. Each list is already sorted from smallest to largest. Join them into one sorted list **using the existing nodes** (relink them; don't copy values into new nodes), and return the head of the result.

Either list can be empty. Each has at most 50 nodes, and values can be negative.

Example: `list1 = 1 → 2 → 4`, `list2 = 1 → 3 → 4` → `1 → 1 → 2 → 3 → 4 → 4`.

## Start with brute force

Walk both lists and copy every value into an array. Sort the array. Build a fresh list from it.

It works, but it throws away the best fact you were given: both lists are *already sorted*. Sorting costs O((n + m) log(n + m)), and you've used O(n + m) extra memory for the array and the new nodes. You can merge in one pass with no extra memory.

## Building the intuition

Imagine two queues of students, each lined up shortest to tallest, and you need one combined line, shortest to tallest.

Who goes first in the combined line? The shortest student overall. That's either the front of queue A or the front of queue B; nobody further back can be shorter than the person in front of them. So **compare the two fronts, take the smaller, repeat.** That's the whole algorithm.

Now the linked-list part. "Take the smaller front node and put it at the end of the result" means you need to know where the end of the result is. Keep a pointer `tail` to the last node you attached. Attaching is then `tail.next = node; tail = node`.

But on the very first step there *is* no last node. You'd write an `if result is empty` branch just for the head. That branch is where bugs live.

The fix is the **dummy head**: a fake node you create before the loop. `tail` starts on it, so there's always a node to attach to. When you're done, the real list starts at `dummy.next`.

## The optimal approach

1. Create `dummy`, a throwaway node. Set `tail = dummy`.
2. While both lists still have nodes:
   - If `list1.val <= list2.val`, attach `list1` (`tail.next = list1`) and move `list1` forward.
   - Otherwise attach `list2` and move `list2` forward.
   - Move `tail` to the node you just attached.
3. One list is now empty. Attach whatever is left of the other: `tail.next = list1 or list2`.
4. Return `dummy.next`.

The subtle detail is **step 3**. You don't need a second loop to copy the leftovers. The remaining nodes are already linked to each other and already sorted, and every one of them is at least as big as everything you've placed. One assignment hangs the whole chain on.

{{code}}

## Dry run

`list1 = 1 → 2 → 4`, `list2 = 1 → 3 → 4`. "Merged so far" is the chain after `dummy`.

| Step | `list1` front | `list2` front | Take | Merged so far |
|---|---|---|---|---|
| 1 | 1 | 1 | `list1`'s 1 (tie, `<=`) | `1` |
| 2 | 2 | 1 | `list2`'s 1 | `1 → 1` |
| 3 | 2 | 3 | 2 | `1 → 1 → 2` |
| 4 | 4 | 3 | 3 | `1 → 1 → 2 → 3` |
| 5 | 4 | 4 | `list1`'s 4 (tie) | `1 → 1 → 2 → 3 → 4` |
| end | `null` | 4 | attach rest of `list2` | `1 → 1 → 2 → 3 → 4 → 4` |

Return `dummy.next`, the first `1`.

## Complexity

- **Time: O(n + m).** Each loop step places one node for good, and the leftover attach is O(1).
- **Space: O(1).** Just `dummy` and `tail`. We relink existing nodes instead of creating new ones.

## Edge cases and traps

- **One or both lists empty.** The loop never runs and step 3 returns the other list (or `null`). No special case needed.
- **Returning `dummy` instead of `dummy.next`.** You'd return an extra fake node at the front with value `0`.
- **Forgetting `tail = tail.next`.** Every new node would overwrite `dummy.next`, and you'd return one node.
- **Moving the wrong list forward.** If you attach `list1`, advance `list1`, not `list2`. Write the two branches side by side so they mirror each other.
- **Copying leftovers one by one.** It works, but it's extra code for nothing. One assignment does it.

## Say it in the interview

> "Both lists are sorted, so the smallest remaining node is always at the front of one of them. I'll compare the two fronts, attach the smaller one to the end of my result, and advance that list. A dummy head node means I never special-case the first attach, and a tail pointer makes each attach O(1). When one list runs out, I attach the rest of the other in one step. That's O(n + m) time and O(1) extra space."

## Follow-ups interviewers ask

- **"Can you do it recursively?"** Yes: the smaller head's `next` becomes the merge of the rest. It's elegant, but it uses O(n + m) stack space.
- **"What about k sorted lists?"** That's *Merge k Sorted Lists*. Put the k front nodes in a min-heap and repeatedly pop the smallest: O(N log k) for N total nodes. Or merge the lists in pairs, like merge sort.
- **"Why does this matter?"** It's the merge step of merge sort on linked lists, which is how you sort a linked list in O(n log n) without random access.
