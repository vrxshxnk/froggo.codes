class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head  # slow moves 1 step per turn, fast moves 2

        # fast reaches the end first if there is one, so only fast needs checking
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:  # same node (not just same value): fast lapped slow inside a loop
                return True

        return False  # fast hit the end, so there is no loop
