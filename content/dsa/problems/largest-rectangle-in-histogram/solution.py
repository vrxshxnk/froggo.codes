class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []  # indices of bars, heights strictly increasing from bottom to top
        best = 0
        n = len(heights)

        for i in range(n + 1):
            # A height-0 bar after the end flushes every bar still on the stack.
            h = heights[i] if i < n else 0
            while stack and heights[stack[-1]] >= h:
                top = stack.pop()
                # Bar i is the first one to the right that is shorter than `top`, and
                # the new stack top is the last one to the left that is shorter.
                # So `top` is the shortest bar on the open interval between them.
                left = stack[-1] if stack else -1
                best = max(best, heights[top] * (i - left - 1))
            stack.append(i)

        return best
