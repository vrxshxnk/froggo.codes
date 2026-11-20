class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> stack;  // indices of bars, heights strictly increasing from bottom to top
        int best = 0;
        int n = heights.size();

        for (int i = 0; i <= n; i++) {
            // A height-0 bar after the end flushes every bar still on the stack.
            int h = i < n ? heights[i] : 0;
            while (!stack.empty() && heights[stack.back()] >= h) {
                int top = stack.back();
                stack.pop_back();
                // i is the first shorter bar to the right, the new stack top the first
                // shorter bar to the left, so `top` is the shortest bar between them.
                int left = stack.empty() ? -1 : stack.back();
                best = max(best, heights[top] * (i - left - 1));
            }
            stack.push_back(i);
        }
        return best;
    }
};
