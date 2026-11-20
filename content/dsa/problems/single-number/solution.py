class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for x in nums:
            # x ^ x = 0 and x ^ 0 = x, so every pair cancels and only the loner survives
            result ^= x
        return result
