class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // priority_queue is a max-heap by default; flip the comparison to pop the smallest val.
        auto bigger = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(bigger)> heap(bigger);

        // The heap holds the current head of every list: at most k nodes at a time.
        for (ListNode* node : lists)
            if (node) heap.push(node);

        ListNode dummy;  // dummy head: no special case for the first node
        ListNode* tail = &dummy;
        while (!heap.empty()) {
            ListNode* node = heap.top();  // smallest head across all lists
            heap.pop();
            tail->next = node;
            tail = node;
            if (node->next) heap.push(node->next);  // that list's next node is now its head
        }
        return dummy.next;
    }
};
