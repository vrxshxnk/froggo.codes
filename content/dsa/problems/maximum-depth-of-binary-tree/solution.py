class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if root is None:      # an empty tree has no levels
            return 0

        # Each child reports how deep its own subtree goes; we add 1 for this node.
        left = self.maxDepth(root.left)
        right = self.maxDepth(root.right)
        return 1 + max(left, right)
