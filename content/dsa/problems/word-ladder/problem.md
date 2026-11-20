---
id: lc-127
title: Word Ladder
pattern: BFS on an implicit graph
timeBox: 40
summary: Find the length of the shortest chain of words from a start word to an end word, changing one letter at a time and using only dictionary words.
hints:
  - "Think of every word as a node, with an edge between two words that differ in exactly one letter. What are you being asked to find in that graph?"
  - "The shortest path in an unweighted graph is BFS. The hard part is finding a word's neighbours quickly. Comparing it against every other word is O(N) per word."
  - "To find neighbours, change each position of the word to each of the 26 letters and check a hash set of unused dictionary words. Remove a word from the set the moment you enqueue it. Count BFS levels."
insight: The words form a graph where each edge is a one-letter change, and the shortest ladder is a BFS shortest path. You never build the graph. You generate neighbours on the fly by trying all 26 letters at each position and checking a hash set.
time: O(N · M² · 26)
space: O(N · M)
related: [lc-994, lc-200, lc-743, lc-133]
---

## The problem in plain English

You get a `beginWord`, an `endWord`, and a dictionary `wordList`. All words have the same length and use lowercase letters. A **ladder** is a sequence of words that starts at `beginWord` and ends at `endWord`, where each step changes exactly one letter and every word after the first must be in `wordList`. Return the **number of words** in the shortest ladder, or `0` if none exists. `beginWord` doesn't have to be in the list. Word length `M` is at most 10, and the list can hold up to 5000 words.

Example: `hit → cog` with `["hot","dot","dog","lot","log","cog"]` → `5`, via `hit → hot → dot → dog → cog`. That's 5 words, which is 4 changes.

## Start with brute force

Build the graph explicitly. For every pair of words, check whether they differ in exactly one letter (O(M) per pair), and if so, add an edge. Then run BFS from `beginWord`.

Building that graph means comparing every pair: with `N = 5000` and `M = 10`, that's about 5000²/2 × 10 ≈ 1.25 × 10⁸ character comparisons before BFS even starts. That's borderline in C++ and too slow in Python. A DFS that tries every possible ladder is far worse, because it's exponential.

## Building the intuition

First, name what you're looking at. Each word is a **node**. Two words are joined by an **edge** if they differ in one letter. Every step costs the same (one change), so the graph is **unweighted**. And "shortest sequence" in an unweighted graph means **BFS**, the same level-by-level search you used in *Rotting Oranges*: everything one step away, then everything two steps away, and so on. The first time BFS reaches `endWord`, it got there by a shortest route.

The real question is how to find a word's neighbours without comparing it to all `N` words. Turn it around. Instead of asking "which dictionary words are one letter away from `hot`?", **generate** every string one letter away from `hot` and ask "is this a dictionary word?":

- position 0: `aot, bot, cot, …, zot`
- position 1: `hat, hbt, …, hzt`
- position 2: `hoa, hob, …, hoz`

That's `26 × M` candidates, at most 260, and a hash set checks each one in O(M). That beats scanning 5000 words when the dictionary is big.

One more trick does two jobs at once. Keep the dictionary in a set called `unvisited`, and **delete a word from it the moment you put it in the queue**. Now the set means "real words I haven't reached yet", so you can never queue a word twice, and you don't need a separate visited set.

## The optimal approach

1. Put `wordList` in a hash set `unvisited`. If `endWord` isn't in it, return `0`.
2. Remove `beginWord` from `unvisited`, put `beginWord` in a queue, and set `steps = 1`.
3. While the queue isn't empty, process one full **level** (all words currently in the queue):
   - pop `word`; if it equals `endWord`, return `steps`;
   - for each position `i` and each letter `c` other than `word[i]`, form `next`; if `next` is in `unvisited`, remove it and enqueue it.
4. After each level, `steps += 1`.
5. If the queue empties, return `0`.

The subtle detail is **marking a word visited when you enqueue it, not when you pop it**. If you wait until you pop it, the same word can be queued by several parents on the same level. The answer stays correct, but the queue can balloon and time out.

{{code}}

## Dry run

`hit → cog`, list `[hot, dot, dog, lot, log, cog]`

| Level (`steps`) | Queue at start of level | Newly enqueued (and removed from `unvisited`) |
|---|---|---|
| 1 | `hit` | `hot` |
| 2 | `hot` | `dot`, `lot` |
| 3 | `dot`, `lot` | `dog` (from `dot`), `log` (from `lot`) |
| 4 | `dog`, `log` | `cog` (from `dog`). `log` finds `cog` already removed. |
| 5 | `cog` | popped, equals `endWord` → return **5** |

## Complexity

- **Time: O(N · M² · 26).** Each word is popped at most once. For it we try `M` positions × 26 letters, and each candidate costs O(M) to build and hash.
- **Space: O(N · M)** for the set and the queue, which hold at most `N` words of length `M`.

## Edge cases and traps

- **`endWord` not in the list.** The answer is `0` immediately. Check it first, or BFS wastes time exploring.
- **Returning changes instead of words.** The answer counts words, so `steps` starts at 1 for `beginWord`. `hot → dot` is `2`.
- **Marking visited on pop.** It's still correct, but duplicate queue entries can make it time out.
- **Forgetting to restore the letter.** After trying all 26 letters at position `i`, put the original back before moving to `i + 1`, or you'll be changing two letters at once.
- **Using DFS.** DFS finds *a* ladder, not the shortest one.

## Say it in the interview

> "Words are nodes, one-letter changes are edges, and every edge costs the same, so the shortest ladder is a BFS. I don't build the graph. For each word I try all 26 letters at each position and check a hash set of unvisited dictionary words. I remove a word from the set when I enqueue it, so nothing is queued twice. I count BFS levels and return the level where I pop endWord. That's O(N · M² · 26) time and O(N · M) space."

## Follow-ups interviewers ask

- **"Can you make it faster?"** Bidirectional BFS: search from both ends and always expand the smaller frontier, stopping when they meet. The worst case is the same, but it explores far fewer words in practice.
- **"What if you need the actual ladders?"** That's *Word Ladder II*. Run BFS to record each word's parents on shortest paths, then backtrack from `endWord` to list every ladder.
- **"Another way to find neighbours?"** Map wildcard patterns like `h*t` to the words that match them. Words that share a pattern are neighbours. It uses more memory, but it avoids trying letters that lead nowhere.
