# Definition for a Node (LeetCode provides it):
# class Node:
#     def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
#         self.val = int(x)
#         self.next = next
#         self.random = random

class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        # original node -> its copy. None maps to None, so a missing next/random
        # needs no special case below.
        old_to_new = {None: None}

        # Pass 1: make a bare copy of every node. We can't wire random pointers yet,
        # because a random pointer may aim at a node we haven't copied.
        curr = head
        while curr:
            old_to_new[curr] = Node(curr.val)
            curr = curr.next

        # Pass 2: every copy exists now, so wire each one the way its original is wired.
        curr = head
        while curr:
            copy = old_to_new[curr]
            copy.next = old_to_new[curr.next]
            copy.random = old_to_new[curr.random]
            curr = curr.next

        return old_to_new[head]
