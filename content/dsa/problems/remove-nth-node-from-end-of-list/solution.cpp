class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head);  // sits before head, so removing the head is not a special case
        ListNode* slow = &dummy;
        ListNode* fast = &dummy;

        // open a gap of exactly n nodes between slow and fast
        for (int i = 0; i < n; i++) {
            fast = fast->next;
        }

        // slide both until fast is on the last node; slow is then just BEFORE the target
        while (fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next;
        }

        slow->next = slow->next->next;  // unlink the nth node from the end
        return dummy.next;  // not head: head itself may have been removed
    }
};
