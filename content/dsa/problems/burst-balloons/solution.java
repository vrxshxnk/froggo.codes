class Solution {
    public int maxCoins(int[] nums) {
        // Pad with the imaginary 1s at both ends, so every balloon has two neighbours.
        int n = nums.length + 2;
        int[] vals = new int[n];
        vals[0] = vals[n - 1] = 1;
        for (int i = 0; i < nums.length; i++) vals[i + 1] = nums[i];
        // dp[l][r] = best coins from bursting every balloon strictly between l and r,
        // while l and r themselves are still standing.
        int[][] dp = new int[n][n];

        for (int length = 2; length < n; length++) { // distance r - l; short gaps first
            for (int l = 0; l + length < n; l++) {
                int r = l + length;
                int best = 0;
                for (int k = l + 1; k < r; k++) { // k = the LAST balloon burst in (l, r)
                    // When k goes last, its neighbours are exactly l and r.
                    best = Math.max(best, dp[l][k] + vals[l] * vals[k] * vals[r] + dp[k][r]);
                }
                dp[l][r] = best;
            }
        }
        return dp[0][n - 1];
    }
}
