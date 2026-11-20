class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int bestBuy = prices[0];  // cheapest price on any day up to today
        int profit = 0;

        for (int price : prices) {
            if (price < bestBuy) {
                // A cheaper buy day: every later sale is better from here,
                // so the window's left edge jumps to today
                bestBuy = price;
            } else {
                // Sell today, having bought on the best day so far
                profit = max(profit, price - bestBuy);
            }
        }

        return profit;
    }
};
