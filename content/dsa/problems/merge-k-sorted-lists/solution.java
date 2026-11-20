class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Min-heap ordered by val. It holds the current head of every list: at most k nodes.
        PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode node : lists)
            if (node != null) heap.offer(node);

        ListNode dummy = new ListNode(); // dummy head: no special case for the first node
        ListNode tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll(); // smallest head across all lists
            tail.next = node;
            tail = node;
            if (node.next != null) heap.offer(node.next); // that list's next node is now its head
        }
        return dummy.next;
    }
}
