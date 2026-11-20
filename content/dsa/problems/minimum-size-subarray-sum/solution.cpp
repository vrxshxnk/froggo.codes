class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size();
        int left = 0;
        int windowSum = 0;  // sum of nums[left..right]; at most 10^9, fits in 32 bits
        int best = n + 1;   // "no answer yet": longer than any real window

        for (int right = 0; right < n; right++) {
            windowSum += nums[right];

            // While the window is big enough, record it, then try a shorter one.
            // All numbers are positive, so dropping one always lowers the sum.
            while (windowSum >= target) {
                best = min(best, right - left + 1);
                windowSum -= nums[left];
                left++;
            }
        }

        return best == n + 1 ? 0 : best;
    }
};
