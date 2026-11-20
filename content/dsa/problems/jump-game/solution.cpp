class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size();
        int reach = 0;  // farthest index we can get to using the squares seen so far

        for (int i = 0; i < n; i++) {
            if (i > reach) return false;      // a gap: no earlier square can carry us to i
            reach = max(reach, i + nums[i]);  // i + nums[i] <= 10^4 + 10^5, no overflow
            if (reach >= n - 1) return true;  // the last index is already within reach
        }

        return true;
    }
};
