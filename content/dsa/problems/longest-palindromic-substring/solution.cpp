class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        // dp[i][j] = true when s[i..j] (both ends included) reads the same both ways
        vector<vector<bool>> dp(n, vector<bool>(n, false));
        int start = 0, best = 1;  // any single character is a palindrome

        // dp[i][j] needs dp[i+1][j-1], the row below, so fill rows from the bottom up
        for (int i = n - 1; i >= 0; i--) {
            for (int j = i; j < n; j++) {
                // ends must match; lengths 1 and 2 have no middle left to check
                if (s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1])) {
                    dp[i][j] = true;
                    if (j - i + 1 > best) {
                        start = i;
                        best = j - i + 1;
                    }
                }
            }
        }

        return s.substr(start, best);
    }
};
