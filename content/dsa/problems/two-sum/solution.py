class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # value -> index of every number we've passed

        for i, x in enumerate(nums):
            need = target - x
            if need in seen:          # partner already seen?
                return [seen[need], i]
            seen[x] = i               # store AFTER checking, so x can't pair with itself

        return []  # the problem guarantees an answer, so we never get here
