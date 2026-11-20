import heapq


class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.heap = []  # min-heap holding the k largest numbers seen so far
        for x in nums:
            self.add(x)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)  # drop the smallest: it can never be the k-th largest again
        return self.heap[0]           # smallest of the top k = the k-th largest
