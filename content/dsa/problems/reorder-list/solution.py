class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        """
        Do not return anything, modify head in-place instead.
        """
        if head is None:
            return

        # 1. Find the end of the first half. Stopping when fast can't take two more
        #    steps leaves slow on the last node of the first (equal or longer) half.
        slow = fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        # 2. Cut the list in two, then reverse the second half (save, flip, step).
        second = slow.next
        slow.next = None
        prev = None
        while second:
            nxt = second.next
            second.next = prev
            prev = second
            second = nxt
        second = prev  # head of the reversed second half: the old tail

        # 3. Zip the halves: one node from the front, one from the (reversed) back.
        first = head
        while second:  # the second half is never longer, so it runs out first
            first_next, second_next = first.next, second.next  # save both rests
            first.next = second
            second.next = first_next
            first, second = first_next, second_next
