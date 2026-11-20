---
module: backtracking-graphs
title: Backtracking & Graphs
readTime: 10
summary: Learn to explore every possibility without repeating or missing any, first as a decision tree with choose, explore and un-choose, then as the same search over grids and adjacency lists, with DFS, BFS, topological sort and multi-source BFS.
---

## Why this stage matters

Some problems can't be solved with one clever pass. "List every subset", "is there a path that spells this word?", "how many islands?", "can I finish all these courses?". All of them need you to **explore**: try a step, see where it leads, and come back if it's a dead end.

Without a system, exploring turns into nested loops you can't write (how many loops for "every subset"?) or a search that walks in circles forever. This stage gives you two systems that cover nearly all of it:

1. **Backtracking**, for building answers one choice at a time.
2. **Graph search (DFS and BFS)**, for walking over things that are connected: cells in a grid, or nodes in a graph.

They're really one idea. Backtracking is a DFS over a tree of choices.

## The core idea

Picture a maze with a piece of chalk. At every junction you pick a path and mark it. If you hit a dead end, you walk back to the last junction and try the next path. You never walk a marked path twice, and you never miss one. That's backtracking, and it's also DFS.

The precise version has three moves:

- **Choose:** make one decision (add a number, step onto a cell).
- **Explore:** recurse to make the remaining decisions.
- **Un-choose:** undo the decision, so the next option starts from a clean state.

### Draw the decision tree first

Before you write any code, draw the tree for a tiny input. Each node is a partial answer, and each edge is one choice. For the subsets of `[1, 2, 3]`, where you only pick numbers to the right of the last one:

```text
                 []
        /        |       \
      [1]       [2]      [3]
     /   \       |
 [1,2]  [1,3]  [2,3]
   |
[1,2,3]
```

The drawing answers the three questions every backtracking problem asks:

| Question | Subsets | Permutations | Combination Sum |
|---|---|---|---|
| What are the choices at a node? | elements right of the last pick | any unused element | the current candidate or later ones |
| Which nodes are answers? | every node | leaves of length n | nodes whose sum is the target |
| When do I stop going deeper? | no elements left | path is full | sum reached or passed |

Get those three right and the code almost writes itself.

## The templates

### 1. Backtracking: choose, explore, un-choose

Use it when you must **list** all valid arrangements, or **find one** in a huge space you can prune.

```python
def backtrack(start, path):
    if is_answer(path):
        result.append(path[:])     # copy: path keeps changing
        # return here if answers can't be extended
    for i in range(start, len(choices)):
        if not valid(choices[i]):
            continue               # or break, if choices are sorted
        path.append(choices[i])    # choose
        backtrack(i + 1, path)     # explore (i for reuse, 0 + a used[] array for permutations)
        path.pop()                 # un-choose: undo EVERYTHING you changed
```

Three numbers decide which problem you're solving: `i + 1` (each element at most once), `i` (reuse allowed), or loop from `0` with a `used` array (order matters).

### 2. Grid DFS and BFS: the 4-direction array

A grid is a graph where each cell's neighbours are the cells up, down, left and right of it. Don't write four `if` blocks. Loop over a direction array:

```python
directions = ((1, 0), (-1, 0), (0, 1), (0, -1))   # down, up, right, left

def neighbours(r, c):
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:     # bounds check BEFORE indexing
            yield nr, nc
```

A **flood fill** visits every cell of one connected region. With BFS:

```python
from collections import deque

def flood(sr, sc):
    seen[sr][sc] = True            # mark when you PUSH, not when you pop
    queue = deque([(sr, sc)])
    while queue:
        r, c = queue.popleft()
        for nr, nc in neighbours(r, c):
            if not seen[nr][nc] and grid[nr][nc] == LAND:
                seen[nr][nc] = True
                queue.append((nr, nc))
```

Swap the `deque` for a list used as a stack (`pop()` from the end) and you have DFS. For "visit everything connected", either works. For "fewest steps", use BFS.

**Marking visited.** Either keep a separate `seen` grid, or overwrite the cell itself (`'1'` → `'0'`). Overwriting saves memory but changes the input, so say so in an interview. For flood fills, visited is **permanent**. In a backtracking search like *Word Search*, visited belongs to the **current path** only, so you unmark it on the way out.

### 3. Adjacency lists and topological sort (Kahn's algorithm)

When the input is a list of edges, like `[a, b]` for "b before a", first build an **adjacency list**: `graph[u]` is the list of nodes that `u` points to. It lets you find a node's neighbours in O(1) per neighbour, instead of scanning every edge.

```python
graph = [[] for _ in range(n)]
indegree = [0] * n                 # number of arrows coming INTO each node
for a, b in edges:
    graph[b].append(a)             # b -> a
    indegree[a] += 1
```

A **topological order** lists the nodes so that every arrow points forward. One exists exactly when the graph has **no cycle**. **Kahn's algorithm** builds it by repeatedly taking a node that nothing points into:

```python
queue = deque(u for u in range(n) if indegree[u] == 0)
order = []
while queue:
    u = queue.popleft()
    order.append(u)
    for v in graph[u]:
        indegree[v] -= 1           # u is done, so v waits on one fewer thing
        if indegree[v] == 0:
            queue.append(v)
has_cycle = len(order) < n         # nodes on a cycle never reach indegree 0
```

### 4. Multi-source BFS

When something spreads from **many starting points at once**, put all of them in the queue before the BFS starts. A single search then finds each cell's distance to its *nearest* source, in O(m · n) total. To count steps, process the queue one level at a time:

```python
queue = deque(all_sources)         # every source is at distance 0
steps = 0
while queue:
    for _ in range(len(queue)):    # exactly one level = one step
        r, c = queue.popleft()
        for nr, nc in neighbours(r, c):
            if can_enter(nr, nc):
                mark(nr, nc)
                queue.append((nr, nc))
    steps += 1
```

## How to recognise this pattern

- "return **all** subsets / permutations / combinations", "generate every…" → backtracking. Tiny limits (`n ≤ 10`, `n ≤ 20`) are a strong hint that exponential time is expected.
- "find a path in a grid that spells / visits…" without reusing cells → backtracking DFS on a grid.
- "number of islands / regions / connected groups", "size of the largest…" → flood fill.
- "prerequisites", "dependencies", "order of tasks", "is it possible to finish" → adjacency list plus topological sort.
- "minimum minutes / steps until everything is reached", from several starting points → multi-source BFS.
- "which cells can reach the border / the ocean" → search backwards from the border, as a multi-source search.
- "copy / clone a structure with pointers that can loop" → DFS with an old-to-new hash map.

## The mistakes everyone makes

1. **Saving `path` instead of a copy.** Every saved answer ends up as the same (empty) list.
2. **Forgetting part of the un-choose.** If choosing changed two things (the path *and* a `used` flag), undo both.
3. **Marking visited on pop instead of on push.** The same cell gets queued many times, and in counting problems it's counted twice.
4. **A permanent visited set in a path search.** In *Word Search*, a cell used by a failed path must be free for the next path.
5. **Bounds checks after indexing.** Check `0 <= nr < rows` before reading `grid[nr][nc]`, or it crashes (or, in Python, `-1` silently wraps around).
6. **Deep recursion.** A recursive flood fill on a big grid can be tens of thousands of calls deep. Python's default limit is 1000. Use BFS or an explicit stack for grids.
7. **Edge direction.** `[a, b]` = "b before a" means the arrow is `b → a`. Write it in a comment before you build the graph.
8. **One BFS per source.** When sources spread at the same time, use one queue with all of them.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Subsets | The choose / explore / un-choose template; every node is an answer |
| Combination Sum | Reuse with `i`, pruning with sort and `break` |
| Permutations | Order matters: loop from 0 with a `used` array |
| Word Search | Backtracking on a grid; visited belongs to the current path |
| Number of Islands | Flood fill with BFS and the direction array |
| Max Area of Island | Flood fill with an explicit-stack DFS, counting as you go |
| Clone Graph | DFS on an adjacency list; a hash map as the visited set |
| Course Schedule | Indegrees and Kahn's algorithm for cycle detection |
| Pacific Atlantic Water Flow | Searching backwards from the border with multi-source BFS |
| Rotting Oranges | Multi-source BFS level by level: levels are minutes |

Try each problem for its time box before opening the walkthrough. Draw the tree or the grid on paper first. Most bugs in this stage are visible in a drawing before they're visible in code.
