---
id: lc-211
title: Design Add and Search Words Data Structure
pattern: Trie plus DFS on wildcards
timeBox: 25
summary: Build a word store where search queries may contain '.', which matches any single letter.
hints:
  - "Without dots, this is exactly the Trie from the previous problem. What should the walk do when it reaches a '.' instead of a letter?"
  - "A '.' could be any letter, so you have to try every child that exists at that node. Trying several branches and backing up means recursion."
  - "Write dfs(node, i): if i == len(word), return node.is_end. If word[i] is a letter, follow that one child. If it's '.', return true if dfs(child, i + 1) succeeds for any child."
insight: Store the words in a trie. A normal letter has one path forward; a '.' branches into every child that exists. Depth-first search through those branches, and the trie keeps you to paths where real words exist.
time: "addWord O(L); search O(L) without dots, O(26^d · L) worst case with d dots"
space: O(total letters added)
related: [lc-208, lc-212, lc-79]
---

## The problem in plain English

Build a class `WordDictionary` with:

- `addWord(word)`: store a lowercase word.
- `search(word)`: return `true` if some stored word **matches** the query. The query is lowercase letters and `.`, where `.` matches **any one letter**. Lengths must match exactly.

Words are up to 25 letters, queries have at most 2 dots, and there are up to 10⁴ calls.

Example:

```text
addWord("bad"), addWord("dad"), addWord("mad")
search("pad") → false
search("bad") → true
search(".ad") → true    (bad, dad or mad)
search("b..") → true    (bad)
```

## Start with brute force

Keep a list of words. For each query, compare it with every word of the same length, position by position, treating `.` as a match. That's O(N · L) per search, where N is the number of stored words. With 10⁴ words and 10⁴ searches, that's up to 10⁸ word comparisons, each up to 25 characters.

A hash set handles queries with no dots in O(L). With dots you could expand every possibility: one dot is 26 lookups, two dots are 676. That's actually fast enough here, but it's brittle. More dots would explode, and interviewers want to see the trie idea.

## Building the intuition

Start from *Implement Trie (Prefix Tree)*. A query with no dots is just `search` there: walk one letter at a time.

Now picture the walk hitting a `.`. Which edge should it take? It doesn't know. Any of them might lead to a match. So try them **all**, one by one, and if any branch reaches a word ending, the answer is true.

"Try a branch, and if it fails, back up and try the next one" is **depth-first search** with recursion. Each call needs to know two things: which trie node we're at, and which character of the query we're matching next. So the function is `dfs(node, i)`.

Why is this better than the brute force? The trie only has edges for letters that **actually continue some stored word**. A dot at a node with 2 children tries 2 branches, not 26. Dead ends are cut the moment a letter is missing.

## The optimal approach

`addWord` is exactly the Trie's `insert`. For `search`:

1. Define `dfs(node, i)`, meaning "can the query from position `i` onward be matched starting at `node`?"
2. **Base case:** if `i == len(word)`, we've matched every character. Return `node.is_end`.
3. If `word[i]` is a letter: look up that child. If it's missing, return false. Otherwise return `dfs(child, i + 1)`.
4. If `word[i]` is `.`: for every existing child, if `dfs(child, i + 1)` is true, return true. If none work, return false.
5. `search(word)` returns `dfs(root, 0)`.

The subtle detail is the **base case**. Reaching the end of the query isn't enough; a stored word must end *exactly* there. With only "bad" stored, `search("ba")` reaches a real node but must return false, because "ba" isn't a word.

{{code}}

## Dry run

Words `bad`, `dad`, `mad`. Query `".ad"`.

| Call | Char | Action | Result |
|---|---|---|---|
| `dfs(root, 0)` | `.` | try children `b`, `d`, `m` in turn | — |
| `dfs(b, 1)` | `a` | child `a` exists → go | — |
| `dfs(ba, 2)` | `d` | child `d` exists → go | — |
| `dfs(bad, 3)` | end | `is_end` of "bad" is true | **true** |

The first branch succeeds, so the search stops early and never visits `d` or `m`.

Query `"b.d"` with only `bad` stored: root → `b` (letter), then `.` tries the only child `a`, then `d` exists and ends a word → true. Query `"b.."`: same path → true. Query `"pad"`: root has no `p` child → false at once.

## Complexity

- **`addWord`: O(L).** One step per letter.
- **`search`: O(L) with no dots.** With dots, each dot can branch into up to 26 children, so the worst case is O(26^d · L) for d dots. With at most 2 dots, that's at most 676 paths of 25 letters. In practice it's far smaller, because the trie only has edges that exist.
- **Space: O(total letters added)** for the trie, plus O(L) recursion depth during search.

## Edge cases and traps

- **Returning true at the end of the query without checking `is_end`.** `search("ba")` after `addWord("bad")` must be false.
- **A query longer than every word.** The walk runs out of children and returns false. Don't index past the end of the query either; check `i == len(word)` first.
- **Returning the first branch's answer for `.`.** Writing `return dfs(child, i + 1)` inside the loop returns after the first child, even when it fails. Return early only on **true**.
- **A query that is all dots, like `"..."`.** It matches any word of length 3. The DFS handles it; it just explores more.
- **Searching an empty dictionary.** The root has no children, so any query returns false.

## Say it in the interview

> "I'll store words in a trie, exactly like Implement Trie. Search becomes a DFS with two arguments, the trie node and the index in the query. A normal letter has one child to follow. A dot could be any letter, so I try every child that exists and return true if any branch works. At the end of the query I return the node's end flag, so prefixes don't count as words. Add is O(L). Search is O(L) without dots and grows with the number of dots, but the trie prunes every branch that no real word uses."

## Follow-ups interviewers ask

- **"What if there were many dots?"** The worst case grows like 26^d. Two ideas help: group words by length first (a separate trie per length), and cache results for repeated queries.
- **"Support `*` meaning any number of letters?"** At a `*`, try both "match zero letters" (`dfs(node, i + 1)`) and "consume one letter and stay on `*`" (`dfs(child, i)` for each child). It becomes glob matching.
- **"Why not a set with expansion?"** It works for at most 2 dots (676 lookups), but it doesn't scale with more dots. The trie only explores letters that exist.
