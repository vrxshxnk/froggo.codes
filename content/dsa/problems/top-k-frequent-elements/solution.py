from collections import Counter


class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)                     # value -> how many times

        # buckets[c] = values that appear exactly c times (c can be 0..n)
        buckets = [[] for _ in range(len(nums) + 1)]
        for value, c in count.items():
            buckets[c].append(value)

        result = []
        for c in range(len(nums), 0, -1):         # most frequent first
            for value in buckets[c]:
                result.append(value)
                if len(result) == k:
                    return result
        return result
