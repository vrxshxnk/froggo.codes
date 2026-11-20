---
module: bonus-graphs-dsu
title: Union-Find & Advanced Graphs
readTime: 10
summary: Beyond BFS and DFS. Union-Find answers "are these connected?" as edges arrive, Dijkstra finds shortest paths when edges have weights, and Prim and Kruskal build the cheapest network that connects everything. Learn which tool each question needs, and the problems in this stage turn into recognition.
---

## Why this stage matters

In the Graphs stage you used BFS and DFS for everything: flood fills, components, shortest paths in grids. They have two blind spots.

1. **Edges that arrive over time.** If the question is "after each new edge, are `a` and `b` connected?", a DFS has to start over every time. That's O(n) per question, so O(n · E) overall.
2. **Edges with weights.** BFS finds the path with the *fewest edges*. Once edges have different costs, the fewest edges is not the cheapest route.

This stage gives you three tools that fix exactly those gaps: **Union-Find** for connectivity, **Dijkstra** for weighted shortest paths, and **Prim and Kruskal** for minimum spanning trees.

## The core idea

### Union-Find: clubs with presidents

Picture every student starting in their own club, as its president. When two students become friends, their clubs merge: one president steps down and reports to the other. To check whether two students are in the same club, each follows the chain of "who do I report to?" up to a president, and you compare the two presidents.

Precisely: a **disjoint set union** (DSU) stores `parent[x]`. A root has `parent[x] == x`. `find(x)` walks up to the root. `union(a, b)` links one root under the other, and returns `false` if `a` and `b` already shared a root.

Two tricks make it fast:

- **Union by size:** always hang the *smaller* tree under the bigger one. A node only gets deeper when its tree at least doubles in size, so no tree is ever taller than log₂ n.
- **Path compression:** after `find(x)` reaches the root, point every node on that path straight at the root. The next `find` on any of them takes one step.

With both tricks, any sequence of `m` operations costs O(m · α(n)). Here `α` is the **inverse Ackermann function**, which grows so slowly that it stays at 4 or below for any `n` you could ever store. So in practice every operation is O(1). You won't be asked to prove this bound. Just know that union by size alone gives O(log n), and adding path compression takes it to effectively constant.

### Dijkstra: water through pipes

Pour water in at the source. The first node to get wet is the one at the end of the cheapest pipe. The next is whichever node has the smallest total cost through anything already wet. Weights are never negative, so once a node is the cheapest unsettled one, nothing can reach it cheaper later. A **min-heap** hands you that cheapest node in O(log n).

### MST: the cheapest cable plan

A **minimum spanning tree** connects all `n` nodes with `n − 1` edges at the least total cost. There are two classic ways to build one:

- **Kruskal** (edge-first): sort all edges and take each one, cheapest first, unless Union-Find says it would close a cycle.
- **Prim** (node-first): grow one tree outward, always adding the cheapest edge that leaves it. It looks almost exactly like Dijkstra, except the heap key is *the edge's weight*, not *the total distance from the source*.

## The templates

### 1. Union-Find, one reusable class

Use it for connectivity that only grows: counting components, detecting a cycle in an undirected graph, Kruskal, and "merge regions as you sweep".

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while x != root:                      # path compression
            nxt = self.parent[x]
            self.parent[x] = root
            x = nxt
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                      # already connected
        if self.size[ra] < self.size[rb]:     # union by size
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True
```

Two facts carry most problems: **components = n − (successful unions)**, and **a failed union means the edge closes a cycle.**

### 2. Dijkstra with a min-heap

Use it for shortest paths from one source when the weights are non-negative.

```python
import heapq

def dijkstra(graph, src, n):          # graph[u] = [(v, w), ...]
    dist = [-1] * n                   # -1 = not settled
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if dist[u] != -1:
            continue                  # stale entry
        dist[u] = d                   # final on POP, not on push
        for v, w in graph[u]:
            if dist[v] == -1:
                heapq.heappush(heap, (d + w, v))
    return dist
```

It's O(E log E). JavaScript has no built-in heap, so the JavaScript solutions in this stage include a small `MinHeap` class.

### 3. Kruskal

Use it for an MST when you're given an edge list, especially a sparse one.

```python
def kruskal(n, edges):                # edges = [(w, a, b), ...]
    dsu, total, used = DSU(n), 0, 0
    for w, a, b in sorted(edges):
        if dsu.union(a, b):
            total += w
            used += 1
            if used == n - 1:
                break
    return total
```

That's O(E log E), and the time goes into sorting.

### 4. Prim

Use it for an MST on a **complete** graph (every pair is an edge, like points on a plane). The array version below skips the heap and runs in O(n²), which is optimal there. On a sparse graph, use a heap like Dijkstra does, but push `(w, v)` instead of `(d + w, v)`.

```python
def prim(n, cost):                    # cost(u, v) = edge weight
    best, in_tree, total = [float("inf")] * n, [False] * n, 0
    best[0] = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=lambda i: best[i])
        in_tree[u] = True
        total += best[u]
        for v in range(n):
            if not in_tree[v]:
                best[v] = min(best[v], cost(u, v))
    return total
```

## How to recognise this pattern

### BFS, Dijkstra or Union-Find?

| The question | Tool |
|---|---|
| Shortest path, every step costs the same | **BFS** |
| Shortest path, edges have different non-negative costs | **Dijkstra** |
| Shortest path, some costs are 0 or 1 only | 0-1 BFS (a deque), or Dijkstra |
| "Are a and b connected?" / "how many groups?" | BFS/DFS once, or **Union-Find** if edges keep arriving |
| "Which edge creates a cycle?" (undirected) | **Union-Find** |
| "Connect everything as cheaply as possible" | **MST**: Kruskal (edge list) or Prim (dense) |
| "Earliest time / smallest limit such that A reaches B" | Union-Find sweep, binary search + BFS, or Dijkstra on the max |
| An order that respects "x before y" rules | Topological sort (from the Graphs stage) |

Other phrases to listen for:

- "network", "signal", "delay", "cheapest route" with weights → Dijkstra
- "connect all", "minimum cable or wire or cost to link" → MST
- "redundant", "provinces", "friend circles", "groups after merging" → Union-Find
- "one letter at a time", "minimum moves" with equal-cost moves → BFS on an implicit graph

## The mistakes everyone makes

1. **Using BFS on weighted edges.** Fewest edges isn't cheapest. One edge of cost 5 loses to two edges of cost 1.
2. **Locking in a Dijkstra distance on push.** Distances are final when they're popped. Skip stale pops.
3. **A Union-Find without either trick.** A chain of unions builds an O(n)-tall tree, and you'll time out on large tests.
4. **Ignoring `union`'s return value.** It's how you count components and spot cycles.
5. **Running Dijkstra with negative edges.** It gives wrong answers. Use Bellman-Ford instead.
6. **Union-Find on directed graphs.** It only understands undirected connectivity. Directed cycles need DFS colours or Kahn's algorithm.
7. **Labels starting at 1.** Size your arrays `n + 1`.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Number of Provinces | The DSU class, and components = n − successful unions |
| Redundant Connection | A failed union is the edge that closes the cycle |
| Number of Operations to Make Network Connected | Count components, then a budget argument |
| Word Ladder | BFS on a graph you never build: generate neighbours on the fly |
| Network Delay Time | Dijkstra with a min-heap and stale-entry skipping |
| Min Cost to Connect All Points | MST: Prim in O(n²) on a complete graph, with Kruskal as the alternative |
| Swim in Rising Water | Union-Find as a sweep: merge regions as the threshold rises |
| Alien Dictionary | Turning text into "x before y" rules, then a topological sort |

Try each one for its time box first. If you're stuck, decide which row of the table above the problem belongs to. Naming the tool is most of the work in this stage.
