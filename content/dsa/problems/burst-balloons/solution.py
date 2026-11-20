class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        # Pad with the imaginary 1s at both ends, so every balloon has two neighbours.
        vals = [1] + nums + [1]
        n = len(vals)
        # dp[l][r] = best coins from bursting every balloon strictly between l and r,
        # while l and r themselves are still standing.
        dp = [[0] * n for _ in range(n)]

        for length in range(2, n):          # distance r - l; short gaps first
            for l in range(0, n - length):
                r = l + length
                best = 0
                for k in range(l + 1, r):    # k = the LAST balloon burst in (l, r)
                    # When k goes last, its neighbours are exactly l and r.
                    best = max(best, dp[l][k] + vals[l] * vals[k] * vals[r] + dp[k][r])
                dp[l][r] = best

        return dp[0][n - 1]
