class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = root.val  # the tree has at least one node, and a single node is a path

        def gain(node: Optional[TreeNode]) -> int:
            # Returns the best sum of a path that starts at `node` and goes DOWN
            # one side only, so the parent can extend it. Never below 0: a
            # negative branch is simply not taken.
            nonlocal best
            if node is None:
                return 0
            left = max(gain(node.left), 0)
            right = max(gain(node.right), 0)
            # A path that bends at this node may use both sides. It can't be
            # returned upward (it would fork), so record it here.
            best = max(best, node.val + left + right)
            return node.val + max(left, right)

        gain(root)
        return best
