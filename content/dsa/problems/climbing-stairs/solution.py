class Solution:
    def climbStairs(self, n: int) -> int:
        # dp[i] = number of distinct ways to stand on step i
        dp = [0] * (n + 1)
        dp[0] = 1  # one way to be at the ground: take no steps
        dp[1] = 1  # one way to reach step 1: a single 1-step

        for i in range(2, n + 1):
            # the last move onto step i was either a 1-step (from i-1) or a 2-step (from i-2)
            dp[i] = dp[i - 1] + dp[i - 2]

        return dp[n]
