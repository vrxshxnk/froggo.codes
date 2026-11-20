class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        // dp[i][j] = fewest edits to turn the first i chars of word1 into the first j chars of word2
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i; // delete all i characters
        for (int j = 0; j <= n; j++) dp[0][j] = j; // insert all j characters

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1]; // last chars already match: free
                } else {
                    int replace = dp[i - 1][j - 1]; // replace word1's last char with word2's
                    int delete = dp[i - 1][j];      // delete word1's last char
                    int insert = dp[i][j - 1];      // insert word2's last char at the end
                    dp[i][j] = 1 + Math.min(replace, Math.min(delete, insert));
                }
            }
        }

        return dp[m][n];
    }
}
