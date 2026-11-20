class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        result = []
        i, n = 0, len(intervals)
        start, end = newInterval

        # 1. intervals that finish before the new one starts: copy them unchanged
        while i < n and intervals[i][1] < start:
            result.append(intervals[i])
            i += 1

        # 2. intervals that start before the new one ends overlap it: absorb them
        while i < n and intervals[i][0] <= end:
            start = min(start, intervals[i][0])
            end = max(end, intervals[i][1])
            i += 1
        result.append([start, end])

        # 3. everything left starts after the merged block ends: copy unchanged
        while i < n:
            result.append(intervals[i])
            i += 1

        return result
