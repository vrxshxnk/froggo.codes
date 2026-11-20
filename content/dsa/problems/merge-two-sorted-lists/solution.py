class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()  # fake first node, so "attach to the end" never needs a special case
        tail = dummy        # last node of the merged list so far

        while list1 and list2:
            # take the smaller front node; <= keeps equal values in their original order
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next

        # one list is empty; the other is already sorted, so hang it on in one move
        tail.next = list1 if list1 else list2
        return dummy.next  # skip the fake node
