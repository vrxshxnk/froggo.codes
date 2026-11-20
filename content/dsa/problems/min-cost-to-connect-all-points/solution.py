class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        best = [float("inf")] * n  # best[v] = cheapest edge from the tree to point v so far
        in_tree = [False] * n
        best[0] = 0                # start the tree at point 0 for free
        total = 0

        for _ in range(n):
            # Prim: grab the point outside the tree with the cheapest connection
            u = -1
            for i in range(n):
                if not in_tree[i] and (u == -1 or best[i] < best[u]):
                    u = i
            in_tree[u] = True
            total += best[u]

            # u just joined, so it may offer a cheaper edge to the points still outside
            ux, uy = points[u]
            for v in range(n):
                if not in_tree[v]:
                    d = abs(ux - points[v][0]) + abs(uy - points[v][1])
                    if d < best[v]:
                        best[v] = d

        return total
