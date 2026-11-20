class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int x : nums) {
            // x ^ x = 0 and x ^ 0 = x, so every pair cancels and only the loner survives
            result ^= x;
        }
        return result;
    }
};
