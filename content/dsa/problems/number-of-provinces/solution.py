class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n))  # every city starts as its own root
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
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        dsu = DSU(n)
        provinces = n  # start with n separate cities

        for i in range(n):
            for j in range(i + 1, n):  # the matrix is symmetric, so the upper half is enough
                if isConnected[i][j] == 1 and dsu.union(i, j):
                    provinces -= 1     # each successful merge joins two groups into one

        return provinces
