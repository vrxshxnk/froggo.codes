class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = cur = nums[0]  # cur = best sum of a subarray that ENDS at the current index

        for x in nums[1:]:
            # A negative running sum only drags x down, so drop it and start fresh at x.
            cur = max(x, cur + x)
            best = max(best, cur)

        return best
