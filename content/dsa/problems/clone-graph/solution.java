// Definition for a Node (LeetCode provides it):
// class Node {
//     public int val;
//     public List<Node> neighbors;
//     public Node() { val = 0; neighbors = new ArrayList<Node>(); }
//     public Node(int _val) { val = _val; neighbors = new ArrayList<Node>(); }
//     public Node(int _val, ArrayList<Node> _neighbors) { val = _val; neighbors = _neighbors; }
// }

class Solution {
    private final Map<Node, Node> copies = new HashMap<>(); // original -> clone; doubles as "visited"

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (copies.containsKey(node)) return copies.get(node); // already cloned: reuse it, which also stops cycles
        Node copy = new Node(node.val);
        copies.put(node, copy);                // register BEFORE recursing, or a cycle loops forever
        for (Node neighbor : node.neighbors)
            copy.neighbors.add(cloneGraph(neighbor));
        return copy;
    }
}
