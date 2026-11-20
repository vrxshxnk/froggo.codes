class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        n = len(nums)
        left = 0
        window_sum = 0  # sum of nums[left..right]
        best = n + 1    # "no answer yet": longer than any real window

        for right in range(n):
            window_sum += nums[right]

            # While the window is big enough, record it, then try a shorter one.
            # All numbers are positive, so dropping one always lowers the sum.
            while window_sum >= target:
                best = min(best, right - left + 1)
                window_sum -= nums[left]
                left += 1

        return 0 if best == n + 1 else best
