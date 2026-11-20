class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        rows, cols = len(matrix), len(matrix[0])
        # memo[r][c] = length of the longest increasing path STARTING at (r, c); 0 = not computed.
        # Strictly increasing paths can never loop back, so this never changes once known.
        memo = [[0] * cols for _ in range(rows)]

        def dfs(r: int, c: int) -> int:
            if memo[r][c]:
                return memo[r][c]
            best = 1  # the cell on its own
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))
            memo[r][c] = best
            return best

        return max(dfs(r, c) for r in range(rows) for c in range(cols))
