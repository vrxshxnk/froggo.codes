---
id: lc-207
title: Course Schedule
pattern: Topological sort (Kahn's algorithm)
timeBox: 25
summary: Given a number of courses and pairs saying which course must come before which, decide whether it's possible to finish every course.
hints:
  - "Draw the courses as dots and each prerequisite as an arrow from the course you take first to the course it unlocks. When is it impossible to finish?"
  - "It's impossible exactly when the arrows form a loop (a cycle): A needs B, B needs C, C needs A. Nobody in a loop can ever go first."
  - "Count, for each course, how many prerequisites it still has (its indegree). Put every course with 0 in a queue. Pop one, 'take' it, and subtract 1 from each course it unlocks; any that hit 0 join the queue. If you took all the courses, return true."
insight: You can finish everything exactly when the prerequisite graph has no cycle. Kahn's algorithm finds out by repeatedly taking a course with no remaining prerequisites. Courses on a cycle never get there, so if fewer than n courses get taken, there's a cycle.
time: O(V + E)
space: O(V + E)
related: [lc-269, lc-684, lc-133]
---

## The problem in plain English

There are `numCourses` courses, numbered `0` to `numCourses − 1`. You get a list `prerequisites` of pairs `[a, b]`, meaning **you must take course `b` before course `a`**. Return `true` if there's some order in which you can take every course, and `false` if there isn't.

Limits: up to 2,000 courses and 5,000 pairs.

Examples:

- `numCourses = 2`, `prerequisites = [[1, 0]]` → `true`. Take 0, then 1.
- `numCourses = 2`, `prerequisites = [[1, 0], [0, 1]]` → `false`. Course 1 needs 0 and course 0 needs 1, so neither can go first.

Watch the order inside a pair: `[a, b]` means `b` comes **first**. Getting it backwards is the most common mistake, although for this yes/no question either direction gives the same answer.

## Start with brute force

Try every possible order of the courses and check whether one of them respects every prerequisite. There are `n!` orders. With just 15 courses that's over a trillion orders. With 2,000 it's hopeless.

A smarter-sounding brute force is to repeatedly scan all courses looking for one whose prerequisites are all done, take it, and scan again. Each scan is O(n + E), and you may need `n` scans. That's O(n · (n + E)), around 14 million steps for the largest input. It works, but it rescans the same courses again and again. The optimal version keeps that idea and drops the rescanning.

## Building the intuition

Draw it. Each course is a node. Each pair `[a, b]` is an arrow `b → a`: "b unlocks a". This is a **directed graph**: the arrows have a direction.

Now think like a student. On your first day, which courses can you take? Only the ones with **no arrows coming in**. Take them. Their arrows are now "satisfied", so cross them out. Some courses may now have no incoming arrows left, so you can take those next. Keep going.

When does this get stuck? When every remaining course still has an arrow coming in. That only happens if the remaining courses form a **cycle**, like 0 → 1 → 0. Each course in a cycle is waiting for another course in the same cycle, so none of them can ever start.

So the plan is to simulate the semester and see whether you take all `n` courses. Two things make the simulation fast:

- **Indegree:** for each course, the count of incoming arrows, meaning prerequisites not yet taken. "Cross out an arrow" is just `indegree[a] -= 1`.
- **Adjacency list:** `graph[b]` lists the courses that `b` unlocks. After taking `b`, you only touch those courses, not the whole list of pairs.

Instead of rescanning for courses whose indegree hit zero, put them in a **queue** the moment it happens.

This process is called **Kahn's algorithm**. The order in which you take courses is a **topological order**: an order where every arrow points forward. A graph has one exactly when it has no cycle.

## The optimal approach

1. Build `graph` as `numCourses` empty lists, and `indegree` as all zeros.
2. For each `[a, b]`: append `a` to `graph[b]`, and add 1 to `indegree[a]`.
3. Put every course with `indegree == 0` into a queue.
4. `taken = 0`. While the queue isn't empty:
   - Pop `course`, and add 1 to `taken`.
   - For each `nxt` in `graph[course]`: subtract 1 from `indegree[nxt]`. If it becomes 0, push `nxt`.
5. Return `taken == numCourses`.

**The subtle detail: why does `taken < numCourses` prove a cycle?** A course on a cycle always has at least one incoming arrow from another course on that same cycle. That course is never taken, so that arrow is never crossed out, so the indegree never reaches 0. Courses that merely *depend on* a cycle are also stuck. Either way, every course that's never taken is blocked by some cycle.

{{code}}

## Dry run

`numCourses = 4`, `prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]`. The arrows are `0 → 1`, `0 → 2`, `1 → 3`, `2 → 3`.

Start: `indegree = [0, 1, 1, 2]`, queue `[0]`.

| Pop | `taken` | Updates | `indegree` after | Queue after |
|---|---|---|---|---|
| 0 | 1 | course 1: 1 → 0 (push), course 2: 1 → 0 (push) | `[0, 0, 0, 2]` | `[1, 2]` |
| 1 | 2 | course 3: 2 → 1 | `[0, 0, 0, 1]` | `[2]` |
| 2 | 3 | course 3: 1 → 0 (push) | `[0, 0, 0, 0]` | `[3]` |
| 3 | 4 | none | | `[]` |

`taken = 4 = numCourses` → **true**.

With `[[1, 0], [0, 1]]`: `indegree = [1, 1]`, so the queue starts empty. `taken` stays 0, and the answer is **false**.

## Complexity

With `V = numCourses` and `E = len(prerequisites)`:

- **Time: O(V + E).** Building the graph touches each pair once. Each course is pushed and popped at most once, and each arrow is crossed out once.
- **Space: O(V + E)** for the adjacency list, plus O(V) for `indegree` and the queue.

## Edge cases and traps

- **Reversing the pair.** `[a, b]` means `b → a`. Here the yes/no answer doesn't change, because reversing every arrow keeps the same cycles. In *Course Schedule II*, where you return the order, it does matter.
- **No prerequisites.** Every indegree is 0, every course is taken, and the answer is `true`.
- **A self-loop `[0, 0]`.** Course 0 needs itself, so its indegree is 1 forever. The answer is `false`, and Kahn's handles it with no special case.
- **A cycle in only one part of the graph.** The other courses get taken but `taken < n`, so the answer is still `false`.
- **Recursive DFS in Python.** The DFS alternative can go 2,000 deep on a chain, past the default limit of 1000. Kahn's uses a queue and has no such problem.

## Say it in the interview

> "I'll model courses as nodes and each prerequisite [a, b] as an edge b → a. I can finish everything exactly when that graph has no cycle. I'll check with Kahn's algorithm. I build an adjacency list and an indegree count, then queue every course with indegree zero. Each time I pop a course I count it as taken and decrement its neighbours' indegrees, queueing any that hit zero. Courses on a cycle never reach zero, so if I took all n courses there's no cycle. That's O(V + E) time and space."

## Follow-ups interviewers ask

- **"Return an actual order."** That's *Course Schedule II*. Append each popped course to a list. If the list has `n` courses, it's a valid order; otherwise return `[]`.
- **"Can you do it with DFS?"** Yes, with three colours. White means unvisited, grey means on the current path, black means done. Reaching a grey node means you found a cycle. It's also O(V + E), but it's recursive.
- **"What's the minimum number of semesters if you can take any number of courses at once?"** Run Kahn's level by level, like the minutes in *Rotting Oranges*. The number of levels is the answer.
