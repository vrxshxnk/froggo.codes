from collections import deque


class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        # Adjacency list: graph[b] lists the courses that b unlocks (edge b -> a)
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses  # how many prerequisites each course still waits on
        for a, b in prerequisites:
            graph[b].append(a)
            indegree[a] += 1

        # Kahn's algorithm: start with every course that needs nothing
        queue = deque(c for c in range(numCourses) if indegree[c] == 0)
        taken = 0
        while queue:
            course = queue.popleft()
            taken += 1
            for nxt in graph[course]:
                indegree[nxt] -= 1        # one fewer prerequisite left for nxt
                if indegree[nxt] == 0:
                    queue.append(nxt)     # all its prerequisites are done

        # Courses on a cycle never reach indegree 0, so they are never taken
        return taken == numCourses
