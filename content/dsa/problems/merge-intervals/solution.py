class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # after sorting by start, anything that overlaps the current block is right next to it
        intervals.sort(key=lambda iv: iv[0])
        merged = []

        for start, end in intervals:
            if merged and start <= merged[-1][1]:
                # overlaps (or touches) the last block: stretch it, but never shrink it
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])  # a gap: start a new block

        return merged
