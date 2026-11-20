class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        result = []
        path = []  # the subset we are building right now

        def backtrack(start: int) -> None:
            # Every node of the decision tree is a valid subset, so record it on arrival
            result.append(path[:])  # copy: path keeps changing after this
            for i in range(start, len(nums)):
                path.append(nums[i])   # choose
                backtrack(i + 1)       # explore: only later elements, so no repeats
                path.pop()             # un-choose

        backtrack(0)
        return result
