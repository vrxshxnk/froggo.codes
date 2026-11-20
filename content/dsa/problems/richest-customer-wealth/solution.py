class Solution:
    def maximumWealth(self, accounts: List[List[int]]) -> int:
        best = 0  # safe start: every amount is at least 1, so any real total beats it

        for row in accounts:
            wealth = 0          # reset for EVERY customer, or totals leak across rows
            for money in row:
                wealth += money
            if wealth > best:
                best = wealth

        return best
