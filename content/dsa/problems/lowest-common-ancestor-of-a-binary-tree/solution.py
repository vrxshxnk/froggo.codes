class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        # What this call returns to its parent:
        #   the LCA, if both p and q are in this subtree;
        #   p or q, if only one of them is;
        #   None, if neither is.
        if root is None or root is p or root is q:
            # If root is p, it's the answer even when q is below it, so stop here.
            return root

        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)

        if left and right:
            return root               # p on one side, q on the other: we're the split point
        return left if left else right  # pass up whichever side found something (or None)
