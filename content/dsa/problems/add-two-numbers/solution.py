class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()  # fake first node, so we can always append to tail
        tail = dummy
        carry = 0

        # keep going while there's a digit left in either list, or a carry to write out
        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next

            carry = total // 10                 # 0 or 1: at most 9 + 9 + 1 = 19
            tail.next = ListNode(total % 10)    # the digit that stays in this column
            tail = tail.next

        return dummy.next
