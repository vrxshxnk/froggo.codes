class Solution {
public:
    void reorderList(ListNode* head) {
        if (head == nullptr) return;

        // 1. Find the end of the first half. Stopping when fast can't take two more
        //    steps leaves slow on the last node of the first (equal or longer) half.
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next != nullptr && fast->next->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }

        // 2. Cut the list in two, then reverse the second half (save, flip, step).
        ListNode* second = slow->next;
        slow->next = nullptr;
        ListNode* prev = nullptr;
        while (second != nullptr) {
            ListNode* nxt = second->next;
            second->next = prev;
            prev = second;
            second = nxt;
        }
        second = prev;  // head of the reversed second half: the old tail

        // 3. Zip the halves: one node from the front, one from the (reversed) back.
        ListNode* first = head;
        while (second != nullptr) {  // the second half is never longer, so it runs out first
            ListNode* firstNext = first->next;   // save both rests
            ListNode* secondNext = second->next;
            first->next = second;
            second->next = firstNext;
            first = firstNext;
            second = secondNext;
        }
    }
};
