---
id: lc-1319
title: Number of Operations to Make Network Connected
pattern: Count components, check cable budget
timeBox: 25
summary: Find the fewest cable moves needed to connect every computer in a network, or -1 if there aren't enough cables.
hints:
  - "Before anything clever: how many cables does it take, at the very least, to connect n computers? Can you answer -1 cases with one comparison?"
  - "If there are k separate groups of computers, how many cables do you need to join them all? Where do those cables come from?"
  - "If cables ≥ n − 1, the answer is (number of connected components) − 1. Count components with Union-Find: start at n, subtract one on every successful union."
insight: Joining k separate groups takes exactly k − 1 cables, and as long as there are at least n − 1 cables in total, the spare ones are always enough. So the answer is just components − 1.
time: O(n + m · α(n))
space: O(n)
related: [lc-547, lc-684, lc-200]
---

## The problem in plain English

There are `n` computers, numbered `0` to `n − 1`, and a list `connections` of cables. Each cable `[a, b]` directly links two computers. In one **operation** you can unplug any cable and plug it in between any two computers. Return the minimum number of operations needed so every computer can reach every other one, or `-1` if it's impossible. `n` can be up to 10⁵, and so can the number of cables.

Example: `n = 4`, `connections = [[0,1],[0,2],[1,2]]` → `1`. Computers 0, 1 and 2 form a triangle, and 3 is alone. The triangle has one cable it doesn't need, so move it to computer 3.

## Start with brute force

You could try to simulate it: find a redundant cable, pick two disconnected groups, move the cable, and repeat. Choosing *which* cable and *which* groups sounds like a search problem. Trying combinations blows up fast, and even a careful simulation that rescans the graph after every move is O(n · (n + m)), about 10¹⁰ steps at the limits.

The good news is that you don't have to simulate anything once you see two counting facts.

## Building the intuition

**Fact 1: the budget.** Any connected network on `n` computers needs at least `n − 1` cables. A tree is the cheapest connected shape, and it has exactly `n − 1` edges. So if `len(connections) < n − 1`, no amount of rearranging helps, and the answer is `-1`. That's one comparison.

**Fact 2: the cost.** Suppose the computers currently form `k` separate groups (connected components). Each cable you move can join at most two groups into one, so you need **at least `k − 1` moves**.

Can you always do it in exactly `k − 1`? You need `k − 1` spare cables, ones you can unplug without splitting a group. A group with `s` computers needs only `s − 1` cables to stay connected, so the cables it needs, summed over all groups, is `n − k`. If you have at least `n − 1` cables, the spares number at least `(n − 1) − (n − k) = k − 1`. Exactly enough.

So the whole problem collapses to: **check the budget, then count components.** Counting components while reading an edge list is a classic Union-Find job: start at `n` and subtract one on every union that actually merges two groups.

## The optimal approach

1. If `len(connections) < n − 1`, return `-1`.
2. Build a DSU with `n` nodes. Set `components = n`.
3. For each cable `[a, b]`: if `union(a, b)` returns `true`, do `components -= 1`.
4. Return `components − 1`.

The subtle detail is **doing the budget check first**. Without it you'd return `components − 1` even when there aren't enough cables to do the moves, like `n = 6` with only 4 cables.

{{code}}

## Dry run

`n = 6`, `connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]`. 5 cables ≥ `n − 1 = 5`, so the budget is fine.

| Cable | Merged? | components | Note |
|---|---|---|---|
| start | | 6 | |
| [0, 1] | yes | 5 | |
| [0, 2] | yes | 4 | |
| [0, 3] | yes | 3 | {0,1,2,3}, {4}, {5} |
| [1, 2] | no, same root | 3 | spare cable |
| [1, 3] | no, same root | 3 | spare cable |

Return `3 − 1 = 2`: move the two spare cables to computers 4 and 5.

## Complexity

- **Time: O(n + m · α(n))**, where `m` is the number of cables. Building the DSU is O(n), and each union is effectively O(1).
- **Space: O(n)** for the DSU. We never build an adjacency list.

## Edge cases and traps

- **Skipping the budget check.** It's the only way the answer can be `-1`, and it doesn't depend on the shape of the graph at all.
- **Counting spare cables and returning that.** The answer is the number of groups minus one, not the number of spares. Extra spares just sit unused.
- **`n = 1`.** Zero cables are enough. `0 < 0` is false, there's one component, so the answer is `0`.
- **Recursive DFS on 10⁵ nodes in Python.** A long chain hits the recursion limit. Union-Find (or an iterative BFS) avoids the problem.

## Say it in the interview

> "Two facts. Connecting n computers needs at least n − 1 cables, so fewer than that is -1 right away. Otherwise, if there are k components I need k − 1 moves, and the spare cables are always enough, because the components only need n − k cables between them. So I count components with Union-Find: start at n and subtract one per successful union. O(n + m · α(n)) time, O(n) space."

## Follow-ups interviewers ask

- **"Prove the spares are enough."** Components need `n − k` cables in total to stay connected. With `m ≥ n − 1` cables, the spares are `m − (n − k) ≥ k − 1`.
- **"Which cables would you move?"** Every union that returns `false` hands you a spare cable. Pair the first `k − 1` spares with one representative from each of the other groups.
- **"BFS instead?"** Build an adjacency list and count flood fills. Same complexity, but it uses more memory for the list.
