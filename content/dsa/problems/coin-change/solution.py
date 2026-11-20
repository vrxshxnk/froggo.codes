class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1  # more coins than any real answer can need (amount 1s at most)
        # dp[a] = the fewest coins that add up to exactly a (INF if a can't be made)
        dp = [INF] * (amount + 1)
        dp[0] = 0  # zero coins make zero

        for a in range(1, amount + 1):
            for c in coins:
                # use c as the last coin: the rest, a - c, must be made as cheaply as possible
                if c <= a and dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1

        return dp[amount] if dp[amount] != INF else -1
