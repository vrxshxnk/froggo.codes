/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const n = s.length;
  // dp[i] = true when the first i characters, s[0..i), can be split into dictionary words
  const dp = new Array(n + 1).fill(false);
  dp[0] = true; // the empty prefix needs no words

  for (let i = 1; i <= n; i++) {
    for (const w of wordDict) {
      const L = w.length;
      // w can be the LAST word of s[0..i) if it fits, the part before it splits,
      // and s really ends with w at position i
      if (L <= i && dp[i - L] && s.startsWith(w, i - L)) {
        dp[i] = true;
        break; // one way is enough
      }
    }
  }

  return dp[n];
};
