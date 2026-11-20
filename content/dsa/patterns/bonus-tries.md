---
module: bonus-tries
title: Tries
readTime: 8
summary: A trie stores words as paths of letters, so every word sharing a prefix shares storage. It answers "does anything start with this?" in time proportional to the prefix, not the dictionary, which powers autocomplete, wildcard search and multi-word grid puzzles.
---

## Why this stage matters

A hash set is brilliant at one question: "is this exact word here?" It's useless at the next one: "does **any** word start with `app`?" To answer that, a set has to check every word it holds.

Autocomplete, spell-check, wildcard search and "find all these words in a grid" all ask the prefix question again and again. A **trie** (said "try"; also called a prefix tree) answers it in O(length of the prefix), no matter how many words are stored.

## The core idea

Think of the thumb index on a paper dictionary. You find "apple" by jumping to **a**, then to the **ap** pages, then **app**. Every word beginning with "app" sits together, and you never read the rest of the book.

A trie builds that index as a tree:

- The **root** stands for the empty string.
- Each **edge** is one letter.
- Each **node** stands for the prefix spelled by the path from the root to it.

```text
insert "app", "apple", "apt", "bat"

(root)
 ├─ a
 │  └─ p
 │     ├─ p ●          ● = a word ends here
 │     │  └─ l
 │     │     └─ e ●
 │     └─ t ●
 └─ b
    └─ a
       └─ t ●
```

"app", "apple" and "apt" share the nodes for `a` and `ap`. Inserting "app" after "apple" creates no new nodes at all; it just marks one.

## The node

Every trie node has two parts:

1. **Children.** Either a **map** from letter to child node, or an **array of 26** slots where slot `c − 'a'` holds the child for letter c. Arrays are fast and simple in C++ and Java. Maps use less memory when nodes have few children and are natural in Python and JavaScript. Both give O(1) per step.
2. **An end marker.** `is_end = true` if an inserted word finishes at this node. Without it, you can't tell "app was inserted" from "app is only part of apple". Some problems store the **word itself** here instead (Word Search II) or a small list of results (Search Suggestions System).

```python
class TrieNode:
    def __init__(self):
        self.children = {}     # letter -> TrieNode
        self.is_end = False    # does an inserted word stop here?
```

## The templates

### Insert: walk, creating what's missing

```python
def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True
```

Only the part of the path that doesn't exist yet gets created.

### Walk: follow a string, or fall off

```python
def walk(root, s):
    node = root
    for ch in s:
        if ch not in node.children:
            return None        # no stored word has this prefix
        node = node.children[ch]
    return node
```

Both queries are built on it.

### search and startsWith: one condition apart

```python
def search(root, word):            # was this exact word inserted?
    node = walk(root, word)
    return node is not None and node.is_end

def starts_with(root, prefix):     # does any word begin with this?
    return walk(root, prefix) is not None
```

All three run in O(L) for a string of length L.

### DFS through the trie: wildcards and grids

When the next step isn't a single letter, recurse over the children. A `.` wildcard tries every child (*Design Add and Search Words Data Structure*). A grid search moves to a neighbouring cell only if its letter is a child of the current node (*Word Search II*).

```python
def dfs(node, i):
    if i == len(word):
        return node.is_end
    if word[i] == ".":
        return any(dfs(child, i + 1) for child in node.children.values())
    child = node.children.get(word[i])
    return child is not None and dfs(child, i + 1)
```

The trie is what keeps this fast: it only has edges that real words use, so dead branches stop immediately.

## Tries over bits

The alphabet doesn't have to be letters. Write each number as 31 bits, highest first, and insert it into a trie whose nodes have just two children, 0 and 1. Now "does any number start with these bits?" is a trie walk. *Maximum XOR of Two Numbers in an Array* uses that to pick, bit by bit from the top, the partner that differs from x as early as possible.

## How to recognise this pattern

- **Prefixes:** "starts with", "autocomplete", "suggestions as you type".
- **Many words checked against one thing:** "find all words from this list in the grid / sentence".
- **Wildcards** in a dictionary lookup (`.` matches any letter).
- A set solution exists, but it has to **scan every word** for each query.
- **"Maximum XOR"** problems: a binary trie over bits.

## The mistakes everyone makes

1. **Forgetting the end flag.** Then `search` acts like `startsWith`, and "app" is "found" after inserting only "apple".
2. **Creating nodes during a search.** Helpers like `setdefault` or `computeIfAbsent` quietly add junk nodes on failed lookups, and later prefix checks lie. Only `insert` creates.
3. **Returning too early in a DFS.** For a wildcard, return early only when a branch returns **true**. Returning the first branch's result skips the others.
4. **Reporting a word twice.** In grid searches, clear the stored word as soon as you record it.
5. **Rebuilding strings from paths.** Storing the word at its end node is simpler and avoids O(L) string building at every hit.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Implement Trie (Prefix Tree) | The node, insert, search and startsWith templates |
| Design Add and Search Words Data Structure | DFS through the trie for `.` wildcards |
| Search Suggestions System | Store answers on nodes: insert sorted, keep the first three |
| Maximum XOR of Two Numbers in an Array | A binary trie plus a greedy, high-bit-first walk |
| Word Search II | The boss: trie-guided backtracking over a grid, with pruning |

Try each problem for its time box before opening the walkthrough. Draw the trie on paper for three or four words. Once you can see the shared paths, every problem here is a small change to the same walk.
