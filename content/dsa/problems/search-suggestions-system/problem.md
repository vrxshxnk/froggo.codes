---
id: lc-1268
title: Search Suggestions System
pattern: Trie storing top-3 at each node
timeBox: 25
summary: As each letter of a search word is typed, list up to three products, in alphabetical order, that start with what has been typed so far.
hints:
  - "After typing k letters, you need the 3 alphabetically smallest products starting with that prefix. Every prefix is a node in a trie of the products."
  - "If you insert the products in sorted order, which products are the first three to pass through any given node?"
  - "Sort the products, insert them into a trie, and let each node keep the indices of the first 3 words that pass through it. Then walk the search word through the trie and read each node's list; once you fall off the trie, every remaining answer is empty."
insight: Sort first, then insert into a trie. Because words arrive in alphabetical order, the first three words to pass through a node are exactly that prefix's three smallest matches, so each node can just remember them.
time: O(n log n · L + S + m), S = total product letters, m = search word length
space: O(S)
related: [lc-208, lc-211, lc-704, lc-49]
---

## The problem in plain English

You get a list of distinct lowercase `products` and a `searchWord`. Imagine typing `searchWord` into a search box, one letter at a time. After each letter, show **up to three** products that start with the letters typed so far. If more than three match, show the three that come first **alphabetically** (lexicographically).

Return a list with one entry per typed letter: `len(searchWord)` lists in total.

Example: products `["mobile", "mouse", "moneypot", "monitor", "mousepad"]`, search word `"mouse"`.

| Typed | Matches, sorted | Shown |
|---|---|---|
| `m` | mobile, moneypot, monitor, mouse, mousepad | mobile, moneypot, monitor |
| `mo` | same five | mobile, moneypot, monitor |
| `mou` | mouse, mousepad | mouse, mousepad |
| `mous` | mouse, mousepad | mouse, mousepad |
| `mouse` | mouse, mousepad | mouse, mousepad |

## Start with brute force

Sort the products once. Then for each of the m prefixes, scan the whole sorted list and take the first three that start with the prefix.

That's O(m · n · L) after sorting: each prefix check can compare up to L characters across n products. With n = 1,000 products and a 1,000-letter search word, that's 10⁶ prefix checks, each possibly long. It passes on small inputs but does the same work again for every letter typed.

## Building the intuition

Every prefix you type is a path from the root of a trie. All products starting with `mou` live in the subtree under the node for `mou`. So each answer is "the three smallest words in some subtree".

Finding the three smallest words in a subtree on every keystroke would mean a DFS each time. Can we precompute it instead?

Here's the trick: **insert products in sorted order**. When `mobile` is inserted, it passes through `m`, `mo`, `mob`, …. Then `moneypot` passes through `m` and `mo`. Then `monitor`. Words arrive alphabetically, so the first three words to *pass through* a node are exactly that node's three alphabetically smallest words.

So each node just keeps a little list, and appends a word only while the list has fewer than three entries. After building, every answer is ready and waiting at its node.

The second observation makes the query side trivial: once the typed prefix leaves the trie (no product has it), every longer prefix also has no products. From then on, every answer is `[]`.

## The optimal approach

1. **Sort** `products` alphabetically.
2. **Build the trie.** For each product (with its index `idx` in sorted order), walk its letters from the root, creating missing nodes. At **every node you pass through**, if `len(node.top) < 3`, append `idx`.
3. **Answer the queries.** Start at the root. For each letter of `searchWord`:
   - if we're still in the trie, move to that letter's child (which may be missing);
   - if we're in the trie, the answer is the products at `node.top`; otherwise `[]`.

The subtle detail: append to `top` at each node **after stepping into it**, not at the root. The root would be the empty prefix, which isn't one of the answers. Storing indices instead of copies of the strings keeps memory small, especially in C++.

{{code}}

## Dry run

Sorted products: `0 mobile`, `1 moneypot`, `2 monitor`, `3 mouse`, `4 mousepad`. The `top` lists after building:

| Node | Words passing through, in order | `top` (first 3) |
|---|---|---|
| `m` | 0, 1, 2, 3, 4 | [0, 1, 2] |
| `mo` | 0, 1, 2, 3, 4 | [0, 1, 2] |
| `mou` | 3, 4 | [3, 4] |
| `mous` | 3, 4 | [3, 4] |
| `mouse` | 3, 4 | [3, 4] |

Walking `"mouse"` reads exactly these rows: `[mobile, moneypot, monitor]` twice, then `[mouse, mousepad]` three times.

With `products = ["havana"]` and search word `"tatiana"`: the root has no `t` child, so `node` becomes null on the first letter, and all seven answers are `[]`.

## Complexity

- **Time: O(n log n · L + S + m).** Sorting compares strings of length up to L. Building visits each of the S total letters once. Answering is one step per typed letter, plus copying at most 3 words per answer.
- **Space: O(S)** for the trie nodes. Each node stores at most 3 indices, so the lists add only O(S) too.

## Edge cases and traps

- **Forgetting to sort first.** The "first three to pass through" are then just the first three in the input, not the smallest.
- **Stopping the output early when no match exists.** The answer always has `len(searchWord)` entries. Pad with empty lists.
- **Walking from a null node.** Once you've fallen off the trie, keep `node` null and skip the lookup. Don't crash on `null.children`.
- **A product equal to a prefix.** If `mouse` is a product and you've typed `mouse`, it's included, and it sorts before `mousepad`, because a prefix comes first alphabetically.
- **Storing all words at every node.** That costs O(n · L) per node in the worst case. Cap the list at 3.

## Say it in the interview

> "Each typed prefix is a node in a trie of the products, and I need the three smallest words under it. If I sort the products first and insert them in that order, the first three words passing through any node are its three smallest, so each node just keeps up to three indices. Then I walk the search word through the trie and read off each node's list. Once I fall off the trie, every remaining answer is empty. That's the sort, plus linear work in the total number of letters."

## Follow-ups interviewers ask

- **"Can you do it without a trie?"** Yes: sort, then for each prefix binary-search for the first product ≥ the prefix and check the next three. Even simpler, keep two pointers `lo` and `hi` over the sorted list and narrow them as each letter is typed.
- **"What if products have popularity scores?"** Keep the top 3 by score at each node instead of the first 3. Updates now need a small heap or a re-sort per node.
- **"Products are added while users type?"** The trie handles inserts in O(L), but each node's top list must be updated with a comparison instead of a simple append.
