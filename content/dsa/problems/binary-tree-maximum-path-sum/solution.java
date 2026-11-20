class Solution {
    private int best;

    public int maxPathSum(TreeNode root) {
        best = root.val; // the tree has at least one node, and a single node is a path
        gain(root);
        return best;
    }

    // Best sum of a path that starts at `node` and goes DOWN one side only,
    // so the parent can extend it. Never below 0: a negative branch is not taken.
    private int gain(TreeNode node) {
        if (node == null) return 0;
        int left = Math.max(gain(node.left), 0);
        int right = Math.max(gain(node.right), 0);
        // A path that bends here may use both sides. It can't be returned upward
        // (it would fork), so record it now.
        best = Math.max(best, node.val + left + right);
        return node.val + Math.max(left, right);
    }
}
