import heapq


class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # The heap holds the current head of every list: at most k nodes at a time.
        # The index i breaks ties so Python never tries to compare two ListNodes.
        heap = []
        for i, node in enumerate(lists):
            if node:
                heap.append((node.val, i, node))
        heapq.heapify(heap)

        dummy = tail = ListNode()  # dummy head: no special case for the first node
        while heap:
            _, i, node = heapq.heappop(heap)  # smallest head across all lists
            tail.next = node
            tail = node
            if node.next:  # that list's next node is now its head
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next
