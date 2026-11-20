class Solution:
    def findMaximumXOR(self, nums: List[int]) -> int:
        # Binary trie over the 31 bits of each number, highest bit first.
        # Each node is a dict {0: child, 1: child}; in Python a dict per node
        # is much faster than a class with a two-slot list.
        root = {}
        best = 0
        for x in nums:
            # Insert x first, so the trie is never empty when we query it
            node = root
            for bit in range(30, -1, -1):
                b = (x >> bit) & 1
                if b not in node:
                    node[b] = {}
                node = node[b]

            # Walk down choosing the OPPOSITE bit whenever we can: a 1 at a high
            # bit beats any combination of lower bits, so greedy is safe
            node = root
            cur = 0
            for bit in range(30, -1, -1):
                b = (x >> bit) & 1
                if 1 - b in node:
                    cur |= 1 << bit
                    node = node[1 - b]
                else:
                    node = node[b]   # always exists: x itself took this path
            best = max(best, cur)
        return best
