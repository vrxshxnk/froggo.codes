class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        s = set(nums)
        best = 0

        for x in s:                    # iterate the SET, so duplicates don't repeat work
            if x - 1 in s:
                continue               # x is in the middle of a run, not its start

            length = 1
            while x + length in s:     # count upward from the start
                length += 1
            best = max(best, length)

        return best
