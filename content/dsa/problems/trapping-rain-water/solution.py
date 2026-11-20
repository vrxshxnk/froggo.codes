class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = 0  # tallest bar seen so far from each end
        water = 0

        while left < right:
            # Move the side with the SHORTER wall. Its water level is decided:
            # the other side already has a wall at least this tall.
            if height[left] < height[right]:
                left_max = max(left_max, height[left])
                water += left_max - height[left]
                left += 1
            else:
                right_max = max(right_max, height[right])
                water += right_max - height[right]
                right -= 1

        return water
