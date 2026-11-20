import heapq


class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []  # min-heap of the k largest numbers seen so far
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)  # the smallest of k + 1 can't be in the top k
        return heap[0]               # smallest of the top k = the k-th largest
