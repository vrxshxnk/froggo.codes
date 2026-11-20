/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var coinChange = function (coins, amount) {
  const INF = amount + 1; // more coins than any real answer can need (amount 1s at most)
  // dp[a] = the fewest coins that add up to exactly a (INF if a can't be made)
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0; // zero coins make zero

  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      // use c as the last coin: the rest, a - c, must be made as cheaply as possible
      if (c <= a && dp[a - c] + 1 < dp[a]) {
        dp[a] = dp[a - c] + 1;
      }
    }
  }

  return dp[amount] !== INF ? dp[amount] : -1;
};
