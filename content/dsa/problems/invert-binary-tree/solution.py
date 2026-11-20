class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root is None:          # an empty tree is its own mirror
            return None

        # Trust the recursion: each call hands back its subtree already mirrored.
        # Compute both before assigning, so we don't overwrite a child we still need.
        left = self.invertTree(root.left)
        right = self.invertTree(root.right)
        root.left = right
        root.right = left

        return root               # this subtree is now mirrored; give it to the parent
