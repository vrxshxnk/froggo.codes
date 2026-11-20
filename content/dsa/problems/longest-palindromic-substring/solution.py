class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        # dp[i][j] = True when s[i..j] (both ends included) reads the same both ways
        dp = [[False] * n for _ in range(n)]
        start, best = 0, 1  # any single character is a palindrome

        # dp[i][j] needs dp[i+1][j-1], the row below, so fill rows from the bottom up
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                # ends must match; lengths 1 and 2 have no middle left to check
                if s[i] == s[j] and (j - i < 2 or dp[i + 1][j - 1]):
                    dp[i][j] = True
                    if j - i + 1 > best:
                        start, best = i, j - i + 1

        return s[start:start + best]
