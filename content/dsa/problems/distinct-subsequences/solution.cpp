class Solution {
public:
    int numDistinct(string s, string t) {
        int m = t.size();
        // dp[j] = number of ways to build t[0..j) from the part of s read so far.
        // unsigned: some cells that never reach the answer can pass 2^64; unsigned
        // overflow just wraps (signed overflow is undefined, and LeetCode flags it).
        vector<unsigned long long> dp(m + 1, 0);
        dp[0] = 1;  // the empty prefix: one way, pick nothing

        for (char c : s) {
            // Right to left so dp[j - 1] is still the value from BEFORE this char.
            for (int j = m; j >= 1; j--) {
                if (t[j - 1] == c) dp[j] += dp[j - 1];  // use c as t[j-1], plus the ways that skip it
            }
        }
        return (int)dp[m];
    }
};
