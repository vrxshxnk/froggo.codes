class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        // What this call returns to its parent:
        //   the LCA, if both p and q are in this subtree;
        //   p or q, if only one of them is;
        //   nullptr, if neither is.
        if (root == nullptr || root == p || root == q) {
            // If root is p, it's the answer even when q is below it, so stop here.
            return root;
        }

        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);

        if (left != nullptr && right != nullptr) return root;  // p on one side, q on the other
        return left != nullptr ? left : right;  // pass up whichever side found something
    }
};
