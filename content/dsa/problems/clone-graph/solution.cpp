// Definition for a Node (LeetCode provides it):
// class Node {
// public:
//     int val;
//     vector<Node*> neighbors;
//     Node() { val = 0; neighbors = vector<Node*>(); }
//     Node(int _val) { val = _val; neighbors = vector<Node*>(); }
//     Node(int _val, vector<Node*> _neighbors) { val = _val; neighbors = _neighbors; }
// };

class Solution {
public:
    Node* cloneGraph(Node* node) {
        if (node == nullptr) return nullptr;
        unordered_map<Node*, Node*> copies;  // original node -> its clone; doubles as "visited"
        return clone(node, copies);
    }

private:
    Node* clone(Node* original, unordered_map<Node*, Node*>& copies) {
        auto it = copies.find(original);
        if (it != copies.end()) return it->second;  // already cloned: reuse it, which also stops cycles
        Node* copy = new Node(original->val);
        copies[original] = copy;                    // register BEFORE recursing, or a cycle loops forever
        for (Node* neighbor : original->neighbors)
            copy->neighbors.push_back(clone(neighbor, copies));
        return copy;
    }
};
