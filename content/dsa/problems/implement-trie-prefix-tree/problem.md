---
id: lc-208
title: Implement Trie (Prefix Tree)
pattern: Trie node with end flag
timeBox: 25
summary: Build a prefix tree that can insert words, check whether a whole word was inserted, and check whether any inserted word starts with a given prefix.
hints:
  - "A set of strings answers search easily, but startsWith would mean scanning every word. Words that share a beginning should share storage. Picture a tree where each edge is one letter."
  - "Each node needs two things: its children (one per next letter, as a map or a 26-slot array) and a flag saying 'a word ends exactly here'."
  - "insert walks letter by letter, creating missing children, then sets the flag. search and startsWith both walk the same way; search also requires the flag at the end, while startsWith only needs the walk to succeed."
insight: Store words as paths from a root, one letter per edge, so shared prefixes share nodes. An is-end flag on each node tells a real word ("app") apart from a prefix that only exists because of a longer word ("apple").
time: O(L) per operation, L = word length
space: O(total letters inserted)
related: [lc-211, lc-212, lc-1268, lc-146]
---

## The problem in plain English

Build a class `Trie` with three methods:

- `insert(word)`: store the word.
- `search(word)`: return `true` only if this **exact** word was inserted.
- `startsWith(prefix)`: return `true` if **any** inserted word begins with `prefix`.

All strings are lowercase English letters, up to 2,000 long, and there are up to 3 × 10⁴ calls in total.

Example:

```text
insert("apple")
search("apple")    → true
search("app")      → false   ("app" is only part of "apple")
startsWith("app")  → true
insert("app")
search("app")      → true
```

A **trie** (said "try", from re*trie*val) is also called a **prefix tree**.

## Start with brute force

Keep a hash set of words. `insert` and `search` are O(L) each (hashing a string of length L), which is great.

The problem is `startsWith`. A hash set can't answer "does anything start with `app`?" without checking every stored word. With 3 × 10⁴ words of length 2,000, one call could cost 6 × 10⁷ character comparisons, and there can be thousands of calls.

You could also store every prefix of every word in a second set. That makes `startsWith` O(L), but a word of length 2,000 has 2,000 prefixes totalling about 2 million characters. Far too much memory.

## Building the intuition

Think of a dictionary's thumb index. To find "apple", you don't read every word. You jump to **a**, then within that to **ap**, then **app**. Every word starting with "app" lives in the same place.

So store words the same way: as a **tree where each edge is a letter**. The root is the empty string. From the root, an `a` edge leads to the node for "a". From there, a `p` edge leads to "ap", and so on. A node *is* a prefix: the letters on the path from the root to it.

```text
(root)
  └─ a
     └─ p
        └─ p   ← end of "app"
           └─ l
              └─ e   ← end of "apple"
```

Now `startsWith("app")` just walks a → p → p. If every edge exists, some word has that prefix. That's O(L), independent of how many words are stored.

But `search("app")` must tell "app was inserted" apart from "app exists only because apple passes through it". The path alone can't. So each node gets one more field: **`is_end`**, set to true on the node where an inserted word finishes.

## The optimal approach

Each `TrieNode` has:

- `children`: a map from letter to child node (or an array of 26 slots, index `c − 'a'`);
- `is_end`: true if an inserted word ends here.

Then:

1. **`insert(word)`**: start at the root. For each letter, if that child is missing, create it. Move into it. After the last letter, set `is_end = true`.
2. **`walk(s)`** (a helper): start at the root and follow each letter. If a child is missing, return null. Otherwise return the node you end on.
3. **`search(word)`**: `walk(word)` is not null **and** that node's `is_end` is true.
4. **`startsWith(prefix)`**: `walk(prefix)` is not null.

The subtle detail is the **difference between search and startsWith**. It's one condition: the end flag. Forgetting it makes `search("app")` return true after only `insert("apple")`.

Map or array? A 26-slot array is fastest and simplest in C++ and Java. A hash map uses less memory when nodes have few children, and it's the natural choice in Python and JavaScript. Both give O(L) per operation.

{{code}}

## Dry run

`insert("apple")`, `search("app")`, `startsWith("app")`, `insert("app")`, `search("app")`

| Call | Walk | What happens | Returns |
|---|---|---|---|
| `insert("apple")` | root → a → p → p → l → e | 5 new nodes; `e` gets `is_end = true` | — |
| `search("app")` | root → a → p → p | path exists, but the second `p` has `is_end = false` | `false` |
| `startsWith("app")` | root → a → p → p | path exists | `true` |
| `insert("app")` | root → a → p → p | no new nodes; the second `p` gets `is_end = true` | — |
| `search("app")` | root → a → p → p | path exists and `is_end = true` | `true` |

Inserting "app" after "apple" created **zero** nodes. That sharing is what makes tries efficient.

## Complexity

- **Time: O(L)** for each `insert`, `search` and `startsWith`, where L is the string's length. One step per letter, each step O(1).
- **Space: O(total letters inserted)** in the worst case (no shared prefixes). Each node is O(26) with arrays or O(children) with maps.

## Edge cases and traps

- **Forgetting `is_end` in `search`.** The classic bug: `search` then behaves like `startsWith`.
- **Inserting the same word twice.** Walks the same path and sets the flag again. Harmless.
- **A word that is a prefix of another, inserted second.** Like "app" after "apple": no new nodes, just a flag. Make sure `insert` doesn't recreate existing children and wipe out the subtree.
- **Creating nodes in `search`.** If your walk uses something like `setdefault` or `computeIfAbsent`, a failed search adds junk nodes and later `startsWith` calls lie. Only `insert` should create.
- **Searching a string longer than any word.** The walk hits a missing child and returns null. Don't index past the end.

## Say it in the interview

> "A hash set handles search but not startsWith, so I'll use a trie. Each node has a children map, or a 26-slot array, and a flag saying a word ends there. Insert walks the word, creating missing nodes, and sets the flag on the last one. Both queries walk the same way. startsWith only needs the path to exist. search also needs the end flag, so 'app' isn't found just because 'apple' was inserted. Every operation is O(length of the string)."

## Follow-ups interviewers ask

- **"Add delete(word)."** Walk to the end and clear `is_end`. To free memory, recurse back up and remove nodes that now have no children and no end flag.
- **"Count how many words start with a prefix."** Keep a `count` on each node, incremented on every insert that passes through. Then `walk(prefix).count` is the answer.
- **"Support wildcards like `b.d`."** That's the next problem in this stage, *Design Add and Search Words Data Structure*: a trie plus DFS.
