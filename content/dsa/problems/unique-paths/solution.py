class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # dp[r][c] = number of different paths from the top-left cell to cell (r, c)
        # every cell in the top row or left column can be reached exactly one way
        dp = [[1] * n for _ in range(m)]

        for r in range(1, m):
            for c in range(1, n):
                # the last move into (r, c) came from above or from the left
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]

        return dp[m - 1][n - 1]
