import heapq


class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = [[] for _ in range(n + 1)]  # graph[u] = list of (v, w), nodes are 1..n
        for u, v, w in times:
            graph[u].append((v, w))

        dist = [-1] * (n + 1)  # -1 = not settled yet
        heap = [(0, k)]        # min-heap of (time to reach node, node)
        settled = answer = 0

        while heap:
            d, u = heapq.heappop(heap)
            if dist[u] != -1:
                continue       # stale entry: u was already settled with a smaller time
            dist[u] = d        # the smallest time in the heap is final (weights are >= 0)
            settled += 1
            answer = max(answer, d)
            for v, w in graph[u]:
                if dist[v] == -1:
                    heapq.heappush(heap, (d + w, v))

        # every node must hear the signal; the last one to hear it sets the answer
        return answer if settled == n else -1
