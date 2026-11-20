class Solution {
    public boolean canJump(int[] nums) {
        int n = nums.length;
        int reach = 0; // farthest index we can get to using the squares seen so far

        for (int i = 0; i < n; i++) {
            if (i > reach) return false;          // a gap: no earlier square can carry us to i
            reach = Math.max(reach, i + nums[i]);
            if (reach >= n - 1) return true;      // the last index is already within reach
        }

        return true;
    }
}
