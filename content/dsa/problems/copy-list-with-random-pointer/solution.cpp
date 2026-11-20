// Definition for a Node (LeetCode provides it):
// class Node {
// public:
//     int val;
//     Node* next;
//     Node* random;
//     Node(int _val) { val = _val; next = NULL; random = NULL; }
// };

class Solution {
public:
    Node* copyRandomList(Node* head) {
        // original node -> its copy. nullptr maps to nullptr, so a missing
        // next/random needs no special case below.
        unordered_map<Node*, Node*> oldToNew;
        oldToNew[nullptr] = nullptr;

        // Pass 1: make a bare copy of every node. We can't wire random pointers yet,
        // because a random pointer may aim at a node we haven't copied.
        for (Node* curr = head; curr != nullptr; curr = curr->next) {
            oldToNew[curr] = new Node(curr->val);
        }

        // Pass 2: every copy exists now, so wire each one the way its original is wired.
        for (Node* curr = head; curr != nullptr; curr = curr->next) {
            Node* copy = oldToNew[curr];
            copy->next = oldToNew[curr->next];
            copy->random = oldToNew[curr->random];
        }

        return oldToNew[head];
    }
};
