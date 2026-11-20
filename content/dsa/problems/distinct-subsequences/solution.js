/**
 * @param {string} s
 * @param {string} t
 * @return {number}
 */
var numDistinct = function (s, t) {
  const m = t.length;
  // dp[j] = number of ways to build t[0..j) from the part of s read so far.
  // Cells that never reach the answer may grow huge and lose precision; every
  // cell that does feed the answer is <= the answer, so it stays exact.
  const dp = new Array(m + 1).fill(0);
  dp[0] = 1; // the empty prefix: one way, pick nothing

  for (const c of s) {
    // Right to left so dp[j - 1] is still the value from BEFORE this char.
    for (let j = m; j >= 1; j--) {
      if (t[j - 1] === c) dp[j] += dp[j - 1]; // use c as t[j-1], plus the ways that skip it
    }
  }
  return dp[m];
};
