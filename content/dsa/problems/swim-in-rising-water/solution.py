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
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        # heights are a permutation of 0..n*n-1, so we can find "the cell of height t" directly
        cell_at = [0] * (n * n)
        for r in range(n):
            for c in range(n):
                cell_at[grid[r][c]] = r * n + c

        dsu = DSU(n * n)  # cell (r, c) is node r * n + c
        for t in range(n * n):
            # at time t exactly one new cell goes underwater: join it to flooded neighbours
            r, c = divmod(cell_at[t], n)
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] <= t:
                    dsu.union(r * n + c, nr * n + nc)
            if dsu.find(0) == dsu.find(n * n - 1):
                return t  # the first moment start and end share a flooded region

        return n * n - 1  # unreachable: by the last time every cell is flooded
