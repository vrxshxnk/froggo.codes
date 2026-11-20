class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n

        # Left pass: answer[i] = product of everything LEFT of i
        running = 1
        for i in range(n):
            answer[i] = running
            running *= nums[i]        # include nums[i] only AFTER using it

        # Right pass: multiply in the product of everything RIGHT of i
        running = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= running
            running *= nums[i]

        return answer
