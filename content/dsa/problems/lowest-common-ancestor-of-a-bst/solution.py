class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        node = root
        while node:
            if p.val < node.val and q.val < node.val:
                node = node.left      # both live in the left subtree
            elif p.val > node.val and q.val > node.val:
                node = node.right     # both live in the right subtree
            else:
                # They split here (or one of them IS this node):
                # this is the deepest node that still holds both.
                return node
        return None  # p and q are guaranteed to exist, so we never get here
