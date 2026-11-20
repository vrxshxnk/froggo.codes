class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        result = []
        path = []
        used = [False] * len(nums)  # used[i]: is nums[i] already in path?

        def backtrack() -> None:
            if len(path) == len(nums):
                result.append(path[:])  # a full arrangement; copy it
                return
            for i in range(len(nums)):  # any unused number may go next, so start at 0
                if used[i]:
                    continue
                used[i] = True          # choose
                path.append(nums[i])
                backtrack()             # explore
                path.pop()              # un-choose: undo BOTH changes
                used[i] = False

        backtrack()
        return result
