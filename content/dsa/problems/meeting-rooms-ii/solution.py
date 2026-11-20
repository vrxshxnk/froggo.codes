import heapq


class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda m: m[0])  # handle meetings in the order they start
        ends = []  # min-heap: end time of the meeting in each room in use

        for start, end in intervals:
            # The room that frees up first is on top. If it is free by now, reuse it.
            # "<=" because a meeting ending at 10 frees its room for one starting at 10.
            if ends and ends[0] <= start:
                heapq.heappop(ends)
            heapq.heappush(ends, end)

        return len(ends)  # never shrinks, so its final size is the most rooms ever in use
