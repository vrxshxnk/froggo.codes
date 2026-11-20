class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int best = 0;

        while (left < right) {
            // Water is capped by the shorter wall, times the distance between them
            int area = min(height[left], height[right]) * (right - left);
            best = max(best, area);

            // The shorter wall can't do better with any closer partner:
            // the width shrinks and its own height still caps the water. Drop it.
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }

        return best;
    }
};
