class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode node = root;
        while (node != null) {
            if (p.val < node.val && q.val < node.val) {
                node = node.left;  // both live in the left subtree
            } else if (p.val > node.val && q.val > node.val) {
                node = node.right; // both live in the right subtree
            } else {
                // They split here (or one of them IS this node):
                // this is the deepest node that still holds both.
                return node;
            }
        }
        return null; // p and q are guaranteed to exist, so we never get here
    }
}
