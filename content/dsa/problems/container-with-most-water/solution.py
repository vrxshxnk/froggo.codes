class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        best = 0

        while left < right:
            # Water is capped by the shorter wall, times the distance between them
            area = min(height[left], height[right]) * (right - left)
            best = max(best, area)

            # The shorter wall can't do better with any closer partner:
            # the width shrinks and its own height still caps the water. Drop it.
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return best
