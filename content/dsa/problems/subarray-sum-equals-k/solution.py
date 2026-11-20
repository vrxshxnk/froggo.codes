from collections import defaultdict


class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = defaultdict(int)  # prefix sum -> how many times we've seen it
        count[0] = 1              # the empty prefix, for subarrays starting at 0
        prefix = 0
        answer = 0

        for x in nums:
            prefix += x
            answer += count[prefix - k]   # earlier prefixes that complete a sum of k
            count[prefix] += 1            # record AFTER looking up

        return answer
