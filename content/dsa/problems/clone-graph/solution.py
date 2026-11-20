# Definition for a Node (LeetCode provides it):
# class Node:
#     def __init__(self, val = 0, neighbors = None):
#         self.val = val
#         self.neighbors = neighbors if neighbors is not None else []


class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        copies = {}  # original node -> its clone; doubles as the "visited" set

        def clone(original: 'Node') -> 'Node':
            if original in copies:
                return copies[original]      # already cloned: reuse it, which also stops cycles
            copy = Node(original.val)
            copies[original] = copy          # register BEFORE recursing, or a cycle loops forever
            for neighbor in original.neighbors:
                copy.neighbors.append(clone(neighbor))
            return copy

        return clone(node) if node else None
