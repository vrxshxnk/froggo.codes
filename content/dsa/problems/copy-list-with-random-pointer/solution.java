// Definition for a Node (LeetCode provides it):
// class Node {
//     int val;
//     Node next;
//     Node random;
//     public Node(int val) { this.val = val; this.next = null; this.random = null; }
// }

class Solution {
    public Node copyRandomList(Node head) {
        // original node -> its copy. null maps to null, so a missing next/random
        // needs no special case below. (Node doesn't override equals, so keys are by identity.)
        Map<Node, Node> oldToNew = new HashMap<>();
        oldToNew.put(null, null);

        // Pass 1: make a bare copy of every node. We can't wire random pointers yet,
        // because a random pointer may aim at a node we haven't copied.
        for (Node curr = head; curr != null; curr = curr.next) {
            oldToNew.put(curr, new Node(curr.val));
        }

        // Pass 2: every copy exists now, so wire each one the way its original is wired.
        for (Node curr = head; curr != null; curr = curr.next) {
            Node copy = oldToNew.get(curr);
            copy.next = oldToNew.get(curr.next);
            copy.random = oldToNew.get(curr.random);
        }

        return oldToNew.get(head);
    }
}
