class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m = len(t)
        # dp[j] = number of ways to build t[:j] from the part of s read so far.
        # Building the empty prefix has exactly one way: pick nothing.
        dp = [1] + [0] * m

        for c in s:
            # Go right to left so dp[j - 1] is still the value from BEFORE this char,
            # the same 0/1-knapsack trick: each char of s is used at most once per match.
            for j in range(m, 0, -1):
                if t[j - 1] == c:
                    dp[j] += dp[j - 1]  # use c as t[j-1], plus the ways that skip it

        return dp[m]
