class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy;           // fake first node, so we can always append to tail
        ListNode* tail = &dummy;
        int carry = 0;

        // keep going while there's a digit left in either list, or a carry to write out
        while (l1 != nullptr || l2 != nullptr || carry != 0) {
            int total = carry;
            if (l1 != nullptr) {
                total += l1->val;
                l1 = l1->next;
            }
            if (l2 != nullptr) {
                total += l2->val;
                l2 = l2->next;
            }

            carry = total / 10;                     // 0 or 1: at most 9 + 9 + 1 = 19
            tail->next = new ListNode(total % 10);  // the digit that stays in this column
            tail = tail->next;
        }

        return dummy.next;
    }
};
