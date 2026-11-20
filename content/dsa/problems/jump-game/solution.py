class Solution:
    def canJump(self, nums: List[int]) -> bool:
        reach = 0  # farthest index we can get to using the squares seen so far

        for i, x in enumerate(nums):
            if i > reach:
                return False  # a gap: no earlier square can carry us to i
            reach = max(reach, i + x)
            if reach >= len(nums) - 1:
                return True   # the last index is already within reach

        return True
