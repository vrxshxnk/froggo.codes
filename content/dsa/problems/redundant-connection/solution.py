class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n))  # every node starts as its own root
        self.size = [1] * n

    def find(self, x: int) -> int:
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        # path compression: point every node we walked past straight at the root
        while x != root:
            nxt = self.parent[x]
            self.parent[x] = root
            x = nxt
        return root

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False              # already in the same group
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra           # union by size: hang the smaller tree under the bigger
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True


class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        dsu = DSU(len(edges) + 1)  # nodes are labelled 1..n, and n == len(edges)

        for a, b in edges:
            if not dsu.union(a, b):
                # a and b were already connected, so this edge closes the cycle.
                # It's the last cycle edge in input order, which is what's asked.
                return [a, b]

        return []  # the input always has exactly one extra edge, so we never get here
