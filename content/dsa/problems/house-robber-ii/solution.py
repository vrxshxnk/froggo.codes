class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]  # one house has no neighbours, not even itself
        # The first and last houses touch, so at most one of them is robbed.
        # Solve the straight-line problem twice: without the last house, and without the first.
        return max(self.robLine(nums, 0, len(nums) - 2),
                   self.robLine(nums, 1, len(nums) - 1))

    def robLine(self, nums: List[int], lo: int, hi: int) -> int:
        # House Robber on nums[lo..hi] with the table squeezed into two variables:
        # prev2 = dp[i-2], prev1 = dp[i-1], where dp[i] = best from the first i houses of the range
        prev2, prev1 = 0, 0
        for k in range(lo, hi + 1):
            cur = max(prev1, prev2 + nums[k])  # skip house k, or rob it on top of dp[i-2]
            prev2, prev1 = prev1, cur
        return prev1
