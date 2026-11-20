class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        // Inorder (left, node, right) visits a BST in sorted order.
        // Do it with an explicit stack so we can stop the moment we hit the k-th node.
        stack<TreeNode*> st;
        TreeNode* node = root;
        while (!st.empty() || node != nullptr) {
            while (node != nullptr) {  // slide as far left as possible: smaller values first
                st.push(node);
                node = node->left;
            }
            node = st.top();           // the smallest value we haven't counted yet
            st.pop();
            if (--k == 0) return node->val;
            node = node->right;        // everything in the right subtree comes next
        }
        return -1;  // k is guaranteed to be valid, so we never get here
    }
};
