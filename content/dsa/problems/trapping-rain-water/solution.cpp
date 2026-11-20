class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0;  // tallest bar seen so far from each end
        int water = 0;

        while (left < right) {
            // Move the side with the SHORTER wall. Its water level is decided:
            // the other side already has a wall at least this tall.
            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};
