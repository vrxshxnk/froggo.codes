class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()

        for x in nums:
            if x in seen:      # already met this value -> duplicate
                return True
            seen.add(x)

        return False           # every value was unique
