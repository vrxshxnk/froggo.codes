class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0];
        int cur = nums[0];  // best sum of a subarray that ENDS at the current index

        for (int i = 1; i < (int)nums.size(); i++) {
            // A negative running sum only drags nums[i] down, so drop it and start fresh.
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }

        return best;  // |sum| <= 10^5 * 10^4 = 10^9, fits in int
    }
};
