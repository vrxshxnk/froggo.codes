class Solution {
    private int best; // longest path (in edges) seen anywhere so far

    public int diameterOfBinaryTree(TreeNode root) {
        best = 0;
        height(root);
        return best;
    }

    // Returns the number of nodes on the longest downward path from node.
    private int height(TreeNode node) {
        if (node == null) return 0;
        int left = height(node.left);
        int right = height(node.right);
        // The longest path that bends at this node uses left + right edges.
        best = Math.max(best, left + right);
        // The parent can only continue ONE branch, so return the taller one.
        return 1 + Math.max(left, right);
    }
}
