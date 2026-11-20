class Solution:
    def rob(self, nums: List[int]) -> int:
        n = len(nums)
        # dp[i] = the most money you can take from the first i houses (nums[0..i-1])
        dp = [0] * (n + 1)
        dp[1] = nums[0]  # one house: take it

        for i in range(2, n + 1):
            skip = dp[i - 1]                # leave house i-1 alone
            take = dp[i - 2] + nums[i - 1]  # rob it, so its left neighbour must be skipped
            dp[i] = max(skip, take)

        return dp[n]
