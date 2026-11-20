---
id: lc-138
title: Copy List with Random Pointer
pattern: Old-to-new node hash map
timeBox: 25
summary: Make a completely separate copy of a linked list whose nodes also have a random pointer that can aim at any node or at null.
hints:
  - "Copying `next` pointers alone is easy: walk and create. The trouble is `random`: it can point at a node further ahead that you haven't copied yet."
  - "Whenever you have an original node, you need to find its copy instantly. What data structure maps one thing to another in O(1)?"
  - "Do two passes with a hash map from original node to copy. Pass 1: create a bare copy of every node and store it in the map. Pass 2: for every original node, set copy.next = map[orig.next] and copy.random = map[orig.random]."
insight: "Keep a hash map from each original node to its copy. First create every copy; then wire each copy's `next` and `random` by looking up where the original's pointers go. Two passes, because a random pointer can aim at a node you haven't copied yet."
time: O(n)
space: O(n)
related: [lc-133, lc-1, lc-146]
---

## The problem in plain English

You get the head of a linked list where every node has three fields: `val`, `next` (the usual arrow to the following node) and `random`, an extra arrow that can point at **any** node in the list, including itself, or at `null`.

Return a **deep copy**: a brand-new list made of brand-new nodes, wired exactly the same way. If original node X's `random` points at original node Y, then X's copy must point at **Y's copy**. No pointer in your copy may lead back into the original list. The list has 0 to 1,000 nodes.

LeetCode writes the input as `[val, random_index]` pairs. Example: `[[7,null],[13,0],[11,4],[10,2],[1,0]]` is five nodes `7 → 13 → 11 → 10 → 1`. `13`'s random points at index 0 (the `7`), `11`'s points at index 4 (the `1`), and so on. Your output must serialise to the same pairs.

## Start with brute force

Copy the `next` chain first: walk the original and build `7' → 13' → 11' → 10' → 1'`.

Now, for each original node, set the copy's `random`. Original `11`'s random is the original node at position 4. To find the matching copy, you count how many steps from the head the target is (walk the original from the head until you hit it), then walk the copy list the same number of steps.

That's correct, but each random pointer costs up to O(n) of walking. With 1,000 nodes that's up to about a million steps for the walks alone, and it's O(n²) in general.

## Building the intuition

Look at what the brute force keeps doing: *"I have an original node. Where's its copy?"* It answers that by walking. Every time.

That's the same question as the Arrays & Hashing stage asked: "where did I see x?". The answer then was a hash map, and it's a hash map now. Map **original node → its copy**. Then "where's the copy of Y?" is one lookup.

Next problem: if you create copies and wire them in the same pass, you'll hit a `random` that points **ahead**. Copy of `11` needs the copy of `1`, which doesn't exist yet.

The fix is to split the work. **Pass 1: just create the copies** (values only, no pointers) and fill the map. **Pass 2: wire everything.** By pass 2 every copy exists, so every lookup succeeds.

One more trick: store `null → null` in the map. Then `map[orig.next]` and `map[orig.random]` work even when the pointer is `null`, and you need no `if` checks.

## The optimal approach

1. Create a map `old_to_new` with one entry: `null → null`.
2. **Pass 1:** walk the original list. For each node, create `Node(node.val)` and store `old_to_new[node] = copy`.
3. **Pass 2:** walk the original list again. For each node:
   - `copy = old_to_new[node]`
   - `copy.next = old_to_new[node.next]`
   - `copy.random = old_to_new[node.random]`
4. Return `old_to_new[head]` (which is `null` for an empty list).

The subtle detail is **what the map keys are**: node references, not values. Values can repeat (`[[3,null],[3,0],[3,null]]` has three `3`s), so a map keyed by value would mix them up. In Python, Java and JavaScript, a node object used as a key is matched by identity, because the node class doesn't define its own equality. In C++, the key is the pointer `Node*`.

{{code}}

## Dry run

`[[7,null],[13,0],[11,4],[10,2],[1,0]]`. Call the originals A(7), B(13), C(11), D(10), E(1), and their copies A′ to E′.

After pass 1 the map is `{null: null, A: A′, B: B′, C: C′, D: D′, E: E′}`, and the copies have no pointers yet.

**Pass 2:**

| Original | `next` → copy's `next` | `random` → copy's `random` | Copy list state |
|---|---|---|---|
| A (7) | B → B′ | null → null | `A′ → B′`, A′.random = null |
| B (13) | C → C′ | A → A′ | `A′ → B′ → C′`, B′.random = A′ |
| C (11) | D → D′ | E → **E′** | `… → C′ → D′`, C′.random = E′ |
| D (10) | E → E′ | C → C′ | `… → D′ → E′`, D′.random = C′ |
| E (1) | null → null | A → A′ | `… → E′ → null`, E′.random = A′ |

Row C is the one the two-pass design exists for: C′ points at E′ before the walk has reached E, and that works because pass 1 already made E′. Return `A′`. It serialises as `[[7,null],[13,0],[11,4],[10,2],[1,0]]`, built entirely from new nodes.

## Complexity

- **Time: O(n).** Two passes, each with O(1) map operations per node.
- **Space: O(n).** The map holds one entry per node. (The copies themselves are the output, so they aren't counted.)

## Edge cases and traps

- **Empty list.** Both passes do nothing, and `old_to_new[null]` returns `null`.
- **A node whose random points at itself.** `copy.random = old_to_new[node]` is the copy itself. Correct.
- **Pointing into the original.** `copy.random = node.random` compiles and *looks* right when printed, but it links your copy to the old list. Always go through the map.
- **Keying the map by value.** Duplicate values break it. Key by the node.
- **Wiring in a single pass.** Fails as soon as a random pointer aims at a node you haven't created yet.

## Say it in the interview

> "The hard part is that `random` can point at any node, including ones I haven't copied yet. So I'll use a hash map from each original node to its copy, and do two passes. First pass, I create a bare copy of every node and put it in the map. Second pass, every copy exists, so I set each copy's `next` and `random` by looking up where the original's pointers go. I seed the map with null to null so I don't need null checks. That's O(n) time and O(n) space."

## Follow-ups interviewers ask

- **"Can you do it in O(1) extra space?"** Yes, by weaving. Pass 1: insert each copy right after its original (`A → A′ → B → B′ …`). Pass 2: `orig.next.random = orig.random.next` when `random` isn't null, because the copy of any node is now the node right after it. Pass 3: unweave the two lists and restore the original.
- **"How is this like Clone Graph?"** It's the same idea in a different shape. *Clone Graph* in the Graphs stage also keeps a map from original to copy, so each node is cloned exactly once even when many edges point at it.
- **"Why not recursion?"** You can clone with a recursive `copy(node)` that checks the map first. It's correct, but with 1,000 nodes in a chain the recursion goes 1,000 levels deep, and the loop version has no such risk.
