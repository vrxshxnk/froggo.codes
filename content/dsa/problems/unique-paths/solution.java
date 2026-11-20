class Solution {
    public int uniquePaths(int m, int n) {
        // dp[r][c] = number of different paths from the top-left cell to cell (r, c)
        // every cell in the top row or left column can be reached exactly one way
        int[][] dp = new int[m][n];
        for (int[] row : dp) Arrays.fill(row, 1);

        for (int r = 1; r < m; r++) {
            for (int c = 1; c < n; c++) {
                // the last move into (r, c) came from above or from the left
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
            }
        }

        return dp[m - 1][n - 1];
    }
}
