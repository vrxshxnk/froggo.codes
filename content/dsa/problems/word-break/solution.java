class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        int n = s.length();
        // dp[i] = true when the first i characters, s[0..i), can be split into dictionary words
        boolean[] dp = new boolean[n + 1];
        dp[0] = true; // the empty prefix needs no words

        for (int i = 1; i <= n; i++) {
            for (String w : wordDict) {
                int L = w.length();
                // w can be the LAST word of s[0..i) if it fits, the part before it splits,
                // and s really ends with w at position i
                if (L <= i && dp[i - L] && s.startsWith(w, i - L)) {
                    dp[i] = true;
                    break; // one way is enough
                }
            }
        }

        return dp[n];
    }
}
