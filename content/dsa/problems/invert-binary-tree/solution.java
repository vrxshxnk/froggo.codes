class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null; // an empty tree is its own mirror

        // Trust the recursion: each call hands back its subtree already mirrored.
        // Compute both before assigning, so we don't overwrite a child we still need.
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;

        return root; // this subtree is now mirrored; give it to the parent
    }
}
