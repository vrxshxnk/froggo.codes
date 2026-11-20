---
module: linked-lists
title: Linked Lists
readTime: 9
summary: Linked list problems are pointer surgery. Learn four moves (the dummy head, three-step reversal, fast and slow pointers, and drawing before you code) and every problem in this stage, up to LRU Cache, becomes a combination of them.
---

## Why this stage matters

With arrays you can jump to any position: `nums[i]` is instant. A linked list takes that away. You only ever hold a pointer to one node, and the only way forward is `node.next`. There's no index, no going backwards, and no length unless you count it.

So the slow, obvious idea in this stage is: **copy the list into an array, solve it there, and build a new list.** It nearly always works, and it always costs O(n) extra memory. Interviewers ask linked list questions precisely to see whether you can do it **in place**, by rewiring the existing nodes with O(1) extra space.

The good news: the rewiring comes down to a few moves. Learn them here, and *LRU Cache*, a classic design question, is just two of them glued to a hash map.

## The core idea

Think of a treasure hunt. Each clue (a node) has something written on it (its value) and tells you where the next clue is hidden (its `next` pointer). You can only carry the clue you're holding. If you rewrite a clue's directions before you've read them, the rest of the hunt is lost forever.

That's the precise version, too:

- A **node** has a `val` and a `next` pointer. The last node's `next` is `null`.
- A **pointer variable** like `curr` is just a name you're holding for one node. Moving it (`curr = curr.next`) changes nothing in the list.
- **Assigning to a field** (`curr.next = something`) changes the list. That's surgery. Before you cut, save anything you'll need.

Every bug in this stage is one of three things: you lost the rest of the list, you followed a `null`, or you returned the wrong node.

## Draw it before you code it

This is the most useful habit in the whole stage. Before writing any pointer code, draw boxes and arrows on paper:

```text
prev    curr    nxt
 |       |       |
null    [1] --> [2] --> [3] --> null
```

Then, for every line you're about to write, redraw the arrows. If an arrow you need has nowhere to come from, you've found your bug before typing it. Do this for a 3-node list and a 1-node list, every time. Interviewers like to see it; it shows you reason about pointers instead of guessing.

## The templates

### 1. The dummy head

When the head of the result might change, or you're building a new list node by node, create a fake node in front. Every real node now has a node before it, so "insert at the front" and "delete the head" stop being special cases.

```python
dummy = ListNode(0, head)   # or ListNode() when building a new list
tail = dummy
# ... attach with: tail.next = node; tail = node
return dummy.next           # never dummy, and not always head
```

Use it in *Merge Two Sorted Lists*, *Add Two Numbers* and *Remove Nth Node From End of List*. *LRU Cache* uses two of them, a sentinel head and a sentinel tail.

### 2. Reversal in three pointer moves

Keep `prev` (the reversed part, starting empty) and `curr`. At each node: **save, flip, step.**

```python
prev, curr = None, head
while curr:
    nxt = curr.next     # save: keep hold of the rest of the list
    curr.next = prev    # flip: point this node backwards
    prev = curr         # step: the reversed part now starts here
    curr = nxt          #       and move on to the saved rest
return prev             # the old tail is the new head
```

Memorise the shape, but understand why each line is there: skip the save and you lose the list; return `head` instead of `prev` and you return the tail.

### 3. Fast and slow pointers

Two pointers start at `head`. `slow` moves one step, `fast` moves two.

**Find the middle.** When `fast` can't move any further, `slow` is in the middle.

```python
slow = fast = head
while fast.next and fast.next.next:
    slow = slow.next
    fast = fast.next.next
# slow is the last node of the first half (the first half gets the extra node)
```

**Detect a cycle.** If the list loops, `fast` eventually laps `slow` and they land on the same node. If not, `fast` reaches `null`.

```python
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow is fast:    # same node, not just same value
        return True
return False
```

A close cousin is the **fixed gap**: move `fast` ahead by `n` first, then move both one step at a time. When `fast` reaches the end, `slow` is `n` behind it. That's how *Remove Nth Node From End of List* finds "n from the end" in one pass.

### 4. Map from node to node

When a node's pointers can aim anywhere (not just at the next node), a hash map from **original node → something** (its copy, its entry) gets you there in O(1). *Copy List with Random Pointer* maps originals to copies; *LRU Cache* maps keys to list nodes.

## How to recognise this pattern

- The input is a `ListNode` and the problem says **in place** or **O(1) extra space**: you're rewiring, not copying.
- **"Reverse"**, **"reorder"**, **"palindrome"**, or anything that needs the list backwards: reversal.
- **"Middle"**, **"cycle"**, **"loop"**, **"n-th from the end"**: fast and slow pointers, or a fixed gap.
- You're **building** a result list, or the **head might be deleted**: dummy head.
- A design problem needs **O(1) "move to front" or "remove the oldest"**: a doubly linked list plus a hash map.
- Two sorted lists to combine: compare the fronts with a dummy head (the merge step of merge sort).

## The mistakes everyone makes

1. **Flipping before saving.** `curr.next = prev` before `nxt = curr.next` loses the rest of the list.
2. **Following a null.** `fast.next.next` crashes if `fast.next` is `null`. Check every pointer you dereference, especially in fast/slow loops.
3. **Returning the wrong node.** After reversal, return `prev`. With a dummy, return `dummy.next`. `head` may have moved or been deleted.
4. **Forgetting to cut.** When you split a list in two, set the first half's last `next` to `null`, or you'll build a cycle.
5. **Comparing values instead of nodes.** Two different nodes can hold the same value. Compare references.
6. **Skipping the drawing.** Most pointer bugs are visible on paper in ten seconds and invisible in code for ten minutes.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Reverse Linked List | Template 2: save, flip, step |
| Merge Two Sorted Lists | Template 1: the dummy head and a tail pointer |
| Linked List Cycle | Template 3: fast and slow pointers meet in a loop |
| Reorder List | Combining three tools: find the middle, reverse, zip |
| Remove Nth Node From End of List | A fixed gap between two pointers, plus a dummy head |
| Add Two Numbers | Building a result list with a dummy head and a carry |
| Copy List with Random Pointer | Template 4: map each original node to its copy |
| LRU Cache | The stage's boss: hash map plus doubly linked list with sentinels |

Try each problem for its time box before opening the walkthrough. And draw the boxes first, every time. It feels slow for a day, then it makes you fast.
