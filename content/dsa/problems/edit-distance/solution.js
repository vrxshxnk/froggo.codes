/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
  const m = word1.length, n = word2.length;
  // dp[i][j] = fewest edits to turn the first i chars of word1 into the first j chars of word2
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i; // delete all i characters
  for (let j = 0; j <= n; j++) dp[0][j] = j; // insert all j characters

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // last chars already match: free
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1], // replace word1's last char with word2's
          dp[i - 1][j],     // delete word1's last char
          dp[i][j - 1],     // insert word2's last char at the end
        );
      }
    }
  }

  return dp[m][n];
};
