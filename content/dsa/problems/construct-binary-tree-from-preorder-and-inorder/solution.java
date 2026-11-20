class Solution {
    private Map<Integer, Integer> indexInInorder;
    private int nextRoot;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        // Values are unique, so each value has exactly one position in inorder.
        indexInInorder = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) indexInInorder.put(inorder[i], i);
        nextRoot = 0; // preorder lists roots first, so we consume it left to right
        return build(preorder, 0, inorder.length - 1);
    }

    // Builds the subtree whose values are exactly inorder[lo..hi].
    private TreeNode build(int[] preorder, int lo, int hi) {
        if (lo > hi) return null;
        int rootVal = preorder[nextRoot++];
        TreeNode root = new TreeNode(rootVal);
        int mid = indexInInorder.get(rootVal);
        // Preorder is root, then the WHOLE left subtree, then the right.
        // So the left subtree must be built first, or we'd take the wrong roots.
        root.left = build(preorder, lo, mid - 1);
        root.right = build(preorder, mid + 1, hi);
        return root;
    }
}
