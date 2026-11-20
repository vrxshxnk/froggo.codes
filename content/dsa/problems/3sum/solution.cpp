class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());  // two pointers need order; duplicates end up side by side
        int n = nums.size();
        vector<vector<int>> result;

        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;                          // smallest is positive: no sum can be 0
            if (i > 0 && nums[i] == nums[i - 1]) continue;   // same first number: same triplets again

            // Two Sum II on the part to the right of i, looking for -nums[i]
            int left = i + 1, right = n - 1;
            while (left < right) {
                int total = nums[i] + nums[left] + nums[right];
                if (total < 0) {
                    left++;
                } else if (total > 0) {
                    right--;
                } else {
                    result.push_back({nums[i], nums[left], nums[right]});
                    left++;
                    right--;
                    // skip copies of the middle number so this triplet isn't added twice
                    while (left < right && nums[left] == nums[left - 1]) left++;
                }
            }
        }

        return result;
    }
};
