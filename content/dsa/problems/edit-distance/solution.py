class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        # dp[i][j] = fewest edits to turn the first i chars of word1 into the first j chars of word2
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i  # delete all i characters
        for j in range(n + 1):
            dp[0][j] = j  # insert all j characters

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]  # last chars already match: free
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j - 1],  # replace word1's last char with word2's
                        dp[i - 1][j],      # delete word1's last char
                        dp[i][j - 1],      # insert word2's last char at the end
                    )

        return dp[m][n]
