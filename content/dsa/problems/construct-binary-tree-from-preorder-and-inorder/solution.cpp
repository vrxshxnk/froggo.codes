class Solution {
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        // Values are unique, so each value has exactly one position in inorder.
        indexInInorder.clear();
        for (int i = 0; i < (int)inorder.size(); i++) indexInInorder[inorder[i]] = i;
        nextRoot = 0;  // preorder lists roots first, so we consume it left to right
        return build(preorder, 0, (int)inorder.size() - 1);
    }

private:
    unordered_map<int, int> indexInInorder;
    int nextRoot = 0;

    // Builds the subtree whose values are exactly inorder[lo..hi].
    TreeNode* build(vector<int>& preorder, int lo, int hi) {
        if (lo > hi) return nullptr;
        int rootVal = preorder[nextRoot++];
        TreeNode* root = new TreeNode(rootVal);
        int mid = indexInInorder[rootVal];
        // Preorder is root, then the WHOLE left subtree, then the right.
        // So the left subtree must be built first, or we'd take the wrong roots.
        root->left = build(preorder, lo, mid - 1);
        root->right = build(preorder, mid + 1, hi);
        return root;
    }
};
