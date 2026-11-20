class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        # dp[i][j] = LCS length of the first i chars of text1 and the first j chars of text2
        # row 0 and column 0 stay 0: an empty string shares nothing
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1  # last chars match: keep both, add one
                else:
                    # last chars differ: one of them is not in the LCS, so drop either
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

        return dp[m][n]
