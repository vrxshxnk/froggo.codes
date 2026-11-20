class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        # Inorder (left, node, right) visits a BST in sorted order.
        # Do it with an explicit stack so we can stop the moment we hit the k-th node.
        stack = []
        node = root
        while stack or node:
            while node:               # slide as far left as possible: smaller values first
                stack.append(node)
                node = node.left
            node = stack.pop()        # the smallest value we haven't counted yet
            k -= 1
            if k == 0:
                return node.val
            node = node.right         # everything in the right subtree comes next
        return -1  # k is guaranteed to be valid, so we never get here
