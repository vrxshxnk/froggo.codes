class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)  # sits before head, so removing the head is not a special case
        slow = fast = dummy

        # open a gap of exactly n nodes between slow and fast
        for _ in range(n):
            fast = fast.next

        # slide both until fast is on the last node; slow is then just BEFORE the target
        while fast.next:
            slow = slow.next
            fast = fast.next

        slow.next = slow.next.next  # unlink the nth node from the end
        return dummy.next  # not head: head itself may have been removed
