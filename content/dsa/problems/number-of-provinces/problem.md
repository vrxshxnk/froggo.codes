---
id: lc-547
title: Number of Provinces
pattern: Union-Find component count
timeBox: 25
summary: Given a matrix saying which cities are directly connected, count how many separate groups of connected cities there are.
hints:
  - "A province is just a connected component: a group where every city can reach every other one through some chain of roads."
  - "Start by assuming every city is its own province. What happens to the count each time you discover two cities from different provinces are connected?"
  - "Use Union-Find. Start with n groups. For every 1 in the upper half of the matrix, union the two cities; if the union actually merged two different groups, subtract one."
insight: Every city starts alone, so there are n groups. Each road that joins two different groups reduces the count by exactly one. Union-Find tells you in near O(1) whether a road merges anything.
time: O(n² · α(n))
space: O(n)
related: [lc-200, lc-1319, lc-684]
---

## The problem in plain English

There are `n` cities, numbered `0` to `n − 1`. You get an `n × n` matrix `isConnected` where `isConnected[i][j] = 1` means city `i` and city `j` have a direct road, and `0` means they don't. The matrix is symmetric, and every city is connected to itself (`isConnected[i][i] = 1`).

Roads chain together: if `A` connects to `B` and `B` connects to `C`, then `A`, `B` and `C` are all in the same **province**. Return the number of provinces. `n` is at most 200.

Example: `[[1,1,0],[1,1,0],[0,0,1]]` → `2`. Cities 0 and 1 form one province, and city 2 is alone in another.

## Start with brute force

The graph way works and is fine here: loop over cities, and whenever you find one you haven't visited, start a DFS from it, mark everything it reaches, and add one to the count. That's O(n²) because each DFS step scans a whole row of the matrix.

So this problem doesn't *need* a faster method. It's here because it is the cleanest possible place to learn **Union-Find**, a tool you'll need when the edges arrive one at a time and DFS would have to start over on every one. That happens in *Redundant Connection* and *Swim in Rising Water*.

## Building the intuition

Forget the matrix for a moment and picture the cities as people at a party, all strangers. That's `n` separate groups.

Now someone reads out the friendships one by one: "0 and 1 are friends." Two groups become one, so the count drops from 3 to 2. "1 and 0 are friends" again: nothing changes, they're already together. "2 and 2": nothing.

So the whole answer is: **start at n, and subtract one every time a road joins two groups that were separate.** The only thing you need is a fast way to ask "are these two already in the same group?" and to merge two groups.

That's exactly what Union-Find (also called a **disjoint set union**, or DSU) does:

- Each group is a little tree. Its root is the group's "leader".
- `find(x)` walks up from `x` to its leader.
- `union(a, b)` finds both leaders. If they're the same, it returns `false`. Otherwise it hangs one leader under the other and returns `true`.

Two tricks keep the trees almost flat (the Union-Find & Advanced Graphs primer explains why): **path compression** (after a `find`, point every node you walked past straight at the leader) and **union by size** (hang the smaller tree under the bigger one).

## The optimal approach

1. Build a DSU with `n` nodes. Set `provinces = n`.
2. For every pair `i < j` (the matrix is symmetric, so the upper half is enough):
   - if `isConnected[i][j] == 1` and `union(i, j)` returns `true`, do `provinces -= 1`.
3. Return `provinces`.

The subtle detail is **using the return value of `union`**. A road between two cities that are already in the same province (like the third side of a triangle) must not lower the count. `union` returning `false` is how you know.

{{code}}

## Dry run

`isConnected = [[1,0,0,1],[0,1,1,0],[0,1,1,1],[1,0,1,1]]` (roads: 0–3, 1–2, 2–3)

| Pair (i, j) | Road? | Leaders before | Merged? | provinces |
|---|---|---|---|---|
| start | | each city is its own leader | | 4 |
| (0, 1) | no | | | 4 |
| (0, 2) | no | | | 4 |
| (0, 3) | yes | 0 and 3 | yes, 3 goes under 0 | 3 |
| (1, 2) | yes | 1 and 2 | yes, 2 goes under 1 | 2 |
| (1, 3) | no | | | 2 |
| (2, 3) | yes | `find(2) = 1`, `find(3) = 0` | yes, sizes tie so 0 goes under 1 | **1** |

All four cities end up with leader 1: one province.

## Complexity

- **Time: O(n² · α(n)).** We look at about n²/2 matrix cells, and each union costs α(n), the inverse Ackermann function. It is at most 4 for any input that fits in the universe, so treat it as a constant. Reading the matrix is O(n²) anyway, so you can't beat this.
- **Space: O(n)** for the `parent` and `size` arrays.

## Edge cases and traps

- **Counting every 1 in the matrix.** A triangle 0–1–2 has three roads but only two of them merge anything. Count successful unions, not ones.
- **Forgetting the diagonal is all 1s.** `union(i, i)` is harmless (it returns `false`), but looping `j` from `i + 1` skips it anyway.
- **A `find` that only walks up.** Without path compression and union by size, a chain of unions can build a tall tree, and each `find` becomes O(n).
- **`union` as a name in C++.** It's a keyword there, so the C++ version calls it `unite`.

## Say it in the interview

> "A province is a connected component. I'll use Union-Find: every city starts as its own group, so the count starts at n. I scan the upper half of the matrix, and for every road I union the two cities. If the union actually merged two different groups, the count drops by one. With path compression and union by size each operation is effectively constant, so it's O(n²) to read the matrix and O(n) extra space. A DFS counting components would also work in O(n²)."

## Follow-ups interviewers ask

- **"Could you do it with DFS or BFS?"** Yes: for each unvisited city, flood-fill from it and add one. Same O(n²) here. Union-Find wins when roads arrive one at a time, because DFS would need to rerun.
- **"What if the input were an edge list instead of a matrix?"** Same code, but loop over the edges: O(E · α(n)) instead of O(n²). That's *Number of Operations to Make Network Connected*.
- **"What if cities could also lose roads?"** Union-Find can't split groups. The usual trick is to process the deletions in reverse, as additions.
