/**
 * @param {number[]} nums
 * @return {number}
 */
var maxCoins = function (nums) {
  // Pad with the imaginary 1s at both ends, so every balloon has two neighbours.
  const vals = [1, ...nums, 1];
  const n = vals.length;
  // dp[l][r] = best coins from bursting every balloon strictly between l and r,
  // while l and r themselves are still standing.
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let length = 2; length < n; length++) { // distance r - l; short gaps first
    for (let l = 0; l + length < n; l++) {
      const r = l + length;
      let best = 0;
      for (let k = l + 1; k < r; k++) { // k = the LAST balloon burst in (l, r)
        // When k goes last, its neighbours are exactly l and r.
        best = Math.max(best, dp[l][k] + vals[l] * vals[k] * vals[r] + dp[k][r]);
      }
      dp[l][r] = best;
    }
  }
  return dp[0][n - 1];
};
