import heapq


class MedianFinder:
    def __init__(self):
        # low holds the smaller half as a max-heap (heapq is a min-heap, so we
        # store negatives). high holds the larger half as a min-heap.
        # Invariant: len(low) == len(high) or len(low) == len(high) + 1.
        self.low = []
        self.high = []

    def addNum(self, num: int) -> None:
        # Push through low first, so the largest of the small half moves up to
        # high. That keeps every element of low <= every element of high.
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        # Rebalance: low may be bigger by one, never smaller.
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def findMedian(self) -> float:
        if len(self.low) > len(self.high):  # odd count: the middle is low's top
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
