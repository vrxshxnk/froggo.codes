class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        // dp[i] = the most money you can take from the first i houses (nums[0..i-1])
        int[] dp = new int[n + 1];
        dp[1] = nums[0]; // one house: take it

        for (int i = 2; i <= n; i++) {
            int skip = dp[i - 1];               // leave house i-1 alone
            int take = dp[i - 2] + nums[i - 1]; // rob it, so its left neighbour must be skipped
            dp[i] = Math.max(skip, take);
        }

        return dp[n];
    }
}
