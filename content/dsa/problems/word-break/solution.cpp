class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        int n = s.size();
        // dp[i] = true when the first i characters, s[0..i), can be split into dictionary words
        vector<bool> dp(n + 1, false);
        dp[0] = true;  // the empty prefix needs no words

        for (int i = 1; i <= n; i++) {
            for (const string& w : wordDict) {
                int L = w.size();
                // w can be the LAST word of s[0..i) if it fits, the part before it splits,
                // and s really ends with w at position i
                if (L <= i && dp[i - L] && s.compare(i - L, L, w) == 0) {
                    dp[i] = true;
                    break;  // one way is enough
                }
            }
        }

        return dp[n];
    }
};
