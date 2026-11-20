class Solution {
public:
    bool isValidBST(TreeNode* root) {
        // 64-bit bounds sit strictly outside the int range, so a node equal to
        // INT_MIN or INT_MAX is never wrongly rejected.
        return valid(root, LLONG_MIN, LLONG_MAX);
    }

private:
    // Every node must lie strictly inside the window (low, high) its ancestors allow.
    bool valid(TreeNode* node, long long low, long long high) {
        if (node == nullptr) return true;
        if (!(low < node->val && node->val < high)) return false;
        // Going left, this node becomes the new upper bound; going right, the new lower bound.
        return valid(node->left, low, node->val) && valid(node->right, node->val, high);
    }
};
