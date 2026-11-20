import heapq


class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        # heapq is a MIN-heap; storing -weight makes the heaviest stone pop first
        heap = [-s for s in stones]
        heapq.heapify(heap)

        while len(heap) > 1:
            y = -heapq.heappop(heap)  # heaviest
            x = -heapq.heappop(heap)  # second heaviest, so x <= y
            if y != x:
                heapq.heappush(heap, -(y - x))  # the leftover piece goes back in

        return -heap[0] if heap else 0
