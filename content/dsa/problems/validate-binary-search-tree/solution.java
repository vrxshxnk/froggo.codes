class Solution {
    public boolean isValidBST(TreeNode root) {
        // 64-bit bounds sit strictly outside the int range, so a node equal to
        // Integer.MIN_VALUE or Integer.MAX_VALUE is never wrongly rejected.
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    // Every node must lie strictly inside the window (low, high) its ancestors allow.
    private boolean valid(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (!(low < node.val && node.val < high)) return false;
        // Going left, this node becomes the new upper bound; going right, the new lower bound.
        return valid(node.left, low, node.val) && valid(node.right, node.val, high);
    }
}
