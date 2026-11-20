class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);

        // Left pass: answer[i] = product of everything LEFT of i
        int running = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = running;
            running *= nums[i];       // include nums[i] only AFTER using it
        }

        // Right pass: multiply in the product of everything RIGHT of i
        running = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= running;
            running *= nums[i];
        }

        return answer;
    }
};
