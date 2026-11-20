class Solution {
    public int coinChange(int[] coins, int amount) {
        int INF = amount + 1; // more coins than any real answer can need (amount 1s at most)
        // dp[a] = the fewest coins that add up to exactly a (INF if a can't be made)
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0; // zero coins make zero

        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                // use c as the last coin: the rest, a - c, must be made as cheaply as possible
                if (c <= a && dp[a - c] + 1 < dp[a]) {
                    dp[a] = dp[a - c] + 1;
                }
            }
        }

        return dp[amount] != INF ? dp[amount] : -1;
    }
}
