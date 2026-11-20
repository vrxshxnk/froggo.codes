class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        # Every node must lie strictly inside the window (low, high) that its
        # ancestors allow. Infinite bounds mean "no limit yet", so a node equal
        # to -2**31 or 2**31 - 1 is never wrongly rejected.
        def valid(node: Optional[TreeNode], low: float, high: float) -> bool:
            if node is None:
                return True
            if not (low < node.val < high):
                return False
            # Going left, this node becomes the new upper bound; going right, the new lower bound.
            return valid(node.left, low, node.val) and valid(node.right, node.val, high)

        return valid(root, float("-inf"), float("inf"))
