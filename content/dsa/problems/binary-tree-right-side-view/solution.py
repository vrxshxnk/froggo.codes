from collections import deque


class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        result = []
        if root is None:
            return result

        queue = deque([root])
        while queue:
            size = len(queue)  # exactly one level is in the queue right now
            for i in range(size):
                node = queue.popleft()
                if i == size - 1:
                    # Left children are queued before right ones, so the last
                    # node of a level is the rightmost one: the one you can see.
                    result.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

        return result
