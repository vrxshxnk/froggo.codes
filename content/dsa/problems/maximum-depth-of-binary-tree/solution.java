class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0; // an empty tree has no levels

        // Each child reports how deep its own subtree goes; we add 1 for this node.
        int left = maxDepth(root.left);
        int right = maxDepth(root.right);
        return 1 + Math.max(left, right);
    }
}
