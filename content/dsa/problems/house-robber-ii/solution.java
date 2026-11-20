class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0]; // one house has no neighbours, not even itself
        // The first and last houses touch, so at most one of them is robbed.
        // Solve the straight-line problem twice: without the last house, and without the first.
        return Math.max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1));
    }

    private int robLine(int[] nums, int lo, int hi) {
        // House Robber on nums[lo..hi] with the table squeezed into two variables:
        // prev2 = dp[i-2], prev1 = dp[i-1], where dp[i] = best from the first i houses of the range
        int prev2 = 0, prev1 = 0;
        for (int k = lo; k <= hi; k++) {
            int cur = Math.max(prev1, prev2 + nums[k]); // skip house k, or rob it on top of dp[i-2]
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
