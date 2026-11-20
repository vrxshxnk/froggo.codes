from collections import deque


class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        result = []
        if root is None:
            return result

        queue = deque([root])
        while queue:
            # Everything in the queue right now is exactly one level.
            # Freeze its size before we start adding the next level behind it.
            size = len(queue)
            level = []
            for _ in range(size):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            result.append(level)

        return result
