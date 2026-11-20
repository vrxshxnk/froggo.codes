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
    def makeConnected(self, n: int, connections: List[List[int]]) -> int:
        # n computers need at least n - 1 cables to be connected at all
        if len(connections) < n - 1:
            return -1

        dsu = DSU(n)
        components = n
        for a, b in connections:
            if dsu.union(a, b):
                components -= 1

        # every cable we don't need is free to move, and we have enough of them,
        # so joining k islands costs exactly k - 1 moves
        return components - 1
