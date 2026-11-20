from collections import deque


class Solution:
    def alienOrder(self, words: List[str]) -> str:
        # letters are nodes 0..25; edge[x][y] means "x comes before y"
        present = [False] * 26
        for w in words:
            for ch in w:
                present[ord(ch) - ord("a")] = True
        edge = [[False] * 26 for _ in range(26)]
        indegree = [0] * 26

        # only ADJACENT words give rules, and only at their first differing letter
        for a, b in zip(words, words[1:]):
            i = 0
            while i < len(a) and i < len(b) and a[i] == b[i]:
                i += 1
            if i == len(a) or i == len(b):   # one word is a prefix of the other
                if len(a) > len(b):
                    return ""                # "abc" before "ab" can never be sorted
                continue                     # "ab" before "abc" says nothing
            x, y = ord(a[i]) - ord("a"), ord(b[i]) - ord("a")
            if not edge[x][y]:               # skip duplicate rules so indegrees stay right
                edge[x][y] = True
                indegree[y] += 1

        # Kahn's algorithm: repeatedly output a letter nothing else must precede
        queue = deque(c for c in range(26) if present[c] and indegree[c] == 0)
        order = []
        while queue:
            x = queue.popleft()
            order.append(chr(x + ord("a")))
            for y in range(26):
                if edge[x][y]:
                    indegree[y] -= 1
                    if indegree[y] == 0:
                        queue.append(y)

        # letters left over are stuck in a cycle: no valid order exists
        return "".join(order) if len(order) == sum(present) else ""
