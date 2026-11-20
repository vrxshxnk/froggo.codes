class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        int[] stack = new int[n + 1]; // indices of bars, heights strictly increasing bottom to top
        int size = 0;
        int best = 0;

        for (int i = 0; i <= n; i++) {
            // A height-0 bar after the end flushes every bar still on the stack.
            int h = i < n ? heights[i] : 0;
            while (size > 0 && heights[stack[size - 1]] >= h) {
                int top = stack[--size];
                // i is the first shorter bar to the right, the new stack top the first
                // shorter bar to the left, so `top` is the shortest bar between them.
                int left = size > 0 ? stack[size - 1] : -1;
                best = Math.max(best, heights[top] * (i - left - 1));
            }
            stack[size++] = i;
        }
        return best;
    }
}
