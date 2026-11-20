class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> result;
        if (root == nullptr) return result;

        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();  // exactly one level is in the queue right now
            for (int i = 0; i < size; i++) {
                TreeNode* node = q.front();
                q.pop();
                // Left children are queued before right ones, so the last
                // node of a level is the rightmost one: the one you can see.
                if (i == size - 1) result.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }

        return result;
    }
};
