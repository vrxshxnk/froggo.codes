class Solution {
public:
    int maxPathSum(TreeNode* root) {
        best = root->val;  // the tree has at least one node, and a single node is a path
        gain(root);
        return best;
    }

private:
    int best;

    // Best sum of a path that starts at `node` and goes DOWN one side only,
    // so the parent can extend it. Never below 0: a negative branch is not taken.
    int gain(TreeNode* node) {
        if (!node) return 0;
        int left = max(gain(node->left), 0);
        int right = max(gain(node->right), 0);
        // A path that bends here may use both sides. It can't be returned upward
        // (it would fork), so record it now.
        best = max(best, node->val + left + right);
        return node->val + max(left, right);
    }
};
