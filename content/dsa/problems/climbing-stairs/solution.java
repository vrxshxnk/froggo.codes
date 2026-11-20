class Solution {
    public int climbStairs(int n) {
        // dp[i] = number of distinct ways to stand on step i
        int[] dp = new int[n + 1];
        dp[0] = 1; // one way to be at the ground: take no steps
        dp[1] = 1; // one way to reach step 1: a single 1-step

        for (int i = 2; i <= n; i++) {
            // the last move onto step i was either a 1-step (from i-1) or a 2-step (from i-2)
            dp[i] = dp[i - 1] + dp[i - 2];
        }

        return dp[n];
    }
}
