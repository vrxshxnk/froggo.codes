class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None   # head of the part we've already reversed (empty at the start)
        curr = head   # the next node whose arrow we need to flip

        while curr:
            nxt = curr.next    # 1. save the rest of the list, or we lose it when we flip
            curr.next = prev   # 2. flip: point this node back at the reversed part
            prev = curr        # 3. step both pointers forward:
            curr = nxt         #    curr joins the reversed part, and we move on to the saved rest

        return prev  # curr fell off the end, so prev is the old tail, now the new head
