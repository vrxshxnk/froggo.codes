class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        best_buy = prices[0]  # cheapest price on any day up to today
        profit = 0

        for price in prices:
            if price < best_buy:
                # A cheaper buy day: every later sale is better from here,
                # so the window's left edge jumps to today
                best_buy = price
            else:
                # Sell today, having bought on the best day so far
                profit = max(profit, price - best_buy)

        return profit
