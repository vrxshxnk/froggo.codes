class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0  # longest path (in edges) seen anywhere so far

        def height(node: Optional[TreeNode]) -> int:
            # Returns the number of nodes on the longest downward path from node.
            nonlocal best
            if node is None:
                return 0
            left = height(node.left)
            right = height(node.right)
            # The longest path that bends at this node uses left + right edges.
            best = max(best, left + right)
            # The parent can only continue ONE branch, so return the taller one.
            return 1 + max(left, right)

        height(root)
        return best
