class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        // dp[i][j] = fewest edits to turn the first i chars of word1 into the first j chars of word2
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 0; i <= m; i++) dp[i][0] = i;  // delete all i characters
        for (int j = 0; j <= n; j++) dp[0][j] = j;  // insert all j characters

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];  // last chars already match: free
                } else {
                    dp[i][j] = 1 + min({
                        dp[i - 1][j - 1],  // replace word1's last char with word2's
                        dp[i - 1][j],      // delete word1's last char
                        dp[i][j - 1],      // insert word2's last char at the end
                    });
                }
            }
        }

        return dp[m][n];
    }
};
