class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        best = 0;
        height(root);
        return best;
    }

private:
    int best = 0;  // longest path (in edges) seen anywhere so far

    // Returns the number of nodes on the longest downward path from node.
    int height(TreeNode* node) {
        if (node == nullptr) return 0;
        int left = height(node->left);
        int right = height(node->right);
        // The longest path that bends at this node uses left + right edges.
        best = max(best, left + right);
        // The parent can only continue ONE branch, so return the taller one.
        return 1 + max(left, right);
    }
};
