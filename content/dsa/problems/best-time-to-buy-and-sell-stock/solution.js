/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  let bestBuy = prices[0]; // cheapest price on any day up to today
  let profit = 0;

  for (const price of prices) {
    if (price < bestBuy) {
      // A cheaper buy day: every later sale is better from here,
      // so the window's left edge jumps to today
      bestBuy = price;
    } else {
      // Sell today, having bought on the best day so far
      profit = Math.max(profit, price - bestBuy);
    }
  }

  return profit;
};
