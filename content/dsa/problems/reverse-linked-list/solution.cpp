class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;  // head of the part we've already reversed (empty at the start)
        ListNode* curr = head;     // the next node whose arrow we need to flip

        while (curr != nullptr) {
            ListNode* nxt = curr->next;  // 1. save the rest, or we lose it when we flip
            curr->next = prev;           // 2. flip: point this node back at the reversed part
            prev = curr;                 // 3. step both pointers forward
            curr = nxt;
        }

        return prev;  // curr fell off the end, so prev is the old tail, now the new head
    }
};
