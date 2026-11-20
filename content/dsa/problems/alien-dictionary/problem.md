---
id: lc-269
title: Alien Dictionary
pattern: Topological sort on letters
timeBox: 40
summary: Given a list of words sorted in an unknown alphabet, recover an order of the letters that is consistent with the list, or return an empty string if none exists.
hints:
  - "Compare two adjacent words. The first position where they differ tells you something exact about two letters. What do the positions after that tell you?"
  - "Each of those facts is a directed edge 'x comes before y'. You need an order of letters that respects every edge. Where have you seen that before?"
  - "Build edges from each adjacent pair's first differing letter, then run Kahn's topological sort over the letters that appear. Return \"\" if a word comes before its own prefix, or if a cycle leaves letters unprocessed."
insight: Each adjacent pair of words gives at most one rule, at their first differing letter. The rules form a directed graph on letters, and any topological order of that graph is a valid alphabet. A cycle, or a longer word placed before its own prefix, means there is no valid alphabet.
time: O(C)
space: O(1)
related: [lc-207, lc-127, lc-208]
---

## The problem in plain English

This is a **LeetCode Premium** problem. LintCode 892 is the same problem and free to practise on. Read its statement to see how it wants ties between several valid orders broken.

An alien language uses lowercase English letters, but in an unknown order. You get `words`, a list that is **sorted** by that alien order, the same way a dictionary is sorted in ours. Return a string containing every letter that appears in `words`, each exactly once, arranged in an order consistent with the list. If several orders work, any one is fine. If no order can make this list sorted, return `""`. There are up to 100 words of up to 100 letters each.

Example: `["wrt","wrf","er","ett","rftt"]` → `"wertf"`.

"Sorted" means the usual dictionary rule: compare letter by letter, and the first difference decides. If one word is a prefix of the other, the shorter one comes first. So `"ab"` before `"abc"` is fine, but `"abc"` before `"ab"` is impossible in any alphabet.

## Start with brute force

Try every ordering of the distinct letters. For each one, check whether the list is sorted under it. With `k` distinct letters that's `k!` orderings. 10 letters already gives 3.6 million, and 26 letters is about 4 × 10²⁶. It's hopeless beyond tiny inputs, but it nails down what "valid" means: **the list must be sorted under the order.**

## Building the intuition

Compare two words the way a dictionary does: `wrt` and `wrf`. The `w`s match and the `r`s match, then `t` versus `f`. They're different, and `wrt` comes first, so **`t` comes before `f`**. That's all this pair tells you. Letters after the first difference tell you nothing, because the first difference already decided the order.

What about non-adjacent words, like the first and the last? If the list is sorted, then each word ≤ the next word, and the chain of adjacent comparisons implies every other comparison. So **adjacent pairs give you every rule you need.**

Now write the rules from the example:

- `wrt` / `wrf` → `t < f`
- `wrf` / `er` → `w < e`
- `er` / `ett` → `r < t`
- `ett` / `rftt` → `e < r`

Each rule is a directed edge `x → y`. You need to line up the letters so that every edge points forward. That's a **topological sort**, the same thing you did with courses and prerequisites in *Course Schedule*. Letters are courses, and rules are prerequisites.

Kahn's algorithm does it. Keep each letter's **indegree** (how many rules say something must come before it). Start with the letters whose indegree is 0. Output one, delete its outgoing edges, and any letter whose indegree drops to 0 becomes available. If letters are still left when you run out, they're stuck in a **cycle** (like `a < b` and `b < a`), and no alphabet exists.

## The optimal approach

1. Mark every letter that appears in any word as `present`.
2. For each adjacent pair `(a, b)`:
   - find the first index `i` where they differ;
   - if there's no difference and `a` is longer than `b`, return `""`, because a word came before its own prefix;
   - otherwise, if they differ, add the edge `a[i] → b[i]` (skip it if it already exists) and increment `indegree[b[i]]`.
3. Run Kahn's algorithm: put every present letter with indegree 0 in a queue, then pop, append to `order`, and decrease each neighbour's indegree, enqueuing the ones that hit 0.
4. If `order` has every present letter, return it. Otherwise there's a cycle, so return `""`.

Two subtle details:

- **Duplicate rules.** `t < f` can show up from several pairs. If you add the edge twice, `f`'s indegree is 2, but Kahn's only removes it once, so `f` never becomes free. That looks like a fake cycle. A 26 × 26 boolean matrix makes deduplication trivial.
- **Letters with no rules.** A letter that never appears in any rule still has to be in the answer. That's why we track `present` separately instead of only collecting letters from edges.

{{code}}

## Dry run

The edges from above are `t → f`, `w → e`, `r → t`, `e → r`. Indegrees: `e 1, f 1, r 1, t 1, w 0`.

| Step | Queue | Pop | Order | Indegrees that drop to 0 |
|---|---|---|---|---|
| start | `w` | | | |
| 1 | `w` | w | `w` | e |
| 2 | `e` | e | `we` | r |
| 3 | `r` | r | `wer` | t |
| 4 | `t` | t | `wert` | f |
| 5 | `f` | f | `wertf` | none |

All 5 present letters are in the order, so return `"wertf"`.

## Complexity

- **Time: O(C)**, where `C` is the total number of characters in all words. Each adjacent comparison stops at the first difference, so it costs at most the shorter word's length. Kahn's algorithm on 26 letters is a constant 26 × 26 at most.
- **Space: O(1).** The alphabet is fixed at 26 letters, so the matrix and arrays have constant size.

## Edge cases and traps

- **A word before its own prefix**, like `["abc", "ab"]`. No alphabet fixes this. Return `""`. Forgetting this case is the most common wrong answer.
- **Comparing past the first difference.** Only the first differing letter is a rule. Adding more creates false edges and fake cycles.
- **Comparing non-adjacent words.** It's unnecessary, and it's easy to get wrong.
- **Duplicate edges inflating indegrees.** Deduplicate them, or decrement once per copy you added.
- **Dropping letters with no rules.** In `["z", "z"]` the answer is `"z"`, not `""`.
- **A cycle.** `["z", "x", "z"]` gives `z < x` and `x < z`. Kahn's algorithm outputs nothing, so return `""`.

## Say it in the interview

> "Each adjacent pair of words gives at most one rule: the first letter where they differ. If there's no difference and the first word is longer, the input is invalid, so I return an empty string. The rules form a directed graph on letters, and any topological order is a valid alphabet. I run Kahn's algorithm with indegrees, deduplicating edges with a 26-by-26 matrix. If the output is missing any letter that appears, there's a cycle and I return an empty string. Time is linear in the total characters, and space is constant because the alphabet is fixed."

## Follow-ups interviewers ask

- **"Return the lexicographically smallest valid order."** Replace the queue with a min-heap, so you always output the smallest available letter.
- **"Is the order unique?"** Only if the queue never holds more than one letter at a time. If it ever has two choices, several orders are valid.
- **"Can you use DFS instead?"** Yes. Post-order DFS with three colours (unvisited, in progress, done) detects a cycle when it meets an in-progress letter. Reverse the post-order to get the answer.
