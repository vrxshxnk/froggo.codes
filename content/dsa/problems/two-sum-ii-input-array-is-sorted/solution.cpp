class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0, right = (int)numbers.size() - 1;

        while (left < right) {
            int total = numbers[left] + numbers[right];
            if (total == target) {
                return {left + 1, right + 1};  // the answer is 1-indexed
            }
            if (total < target) {
                // numbers[left] is too small even with the biggest partner left,
                // so it can't be in any answer: drop it
                left++;
            } else {
                // numbers[right] is too big even with the smallest partner left
                right--;
            }
        }

        return {};  // guaranteed answer, never reached
    }
};
