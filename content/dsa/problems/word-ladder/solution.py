from collections import deque


class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        unvisited = set(wordList)  # O(1) "is this a real word I haven't used yet?"
        if endWord not in unvisited:
            return 0
        unvisited.discard(beginWord)

        queue = deque([beginWord])
        steps = 1  # number of words in the sequence, counting beginWord

        while queue:
            for _ in range(len(queue)):  # one full BFS level = one more word in the ladder
                word = queue.popleft()
                if word == endWord:
                    return steps

                chars = list(word)
                for i in range(len(chars)):
                    original = chars[i]
                    for c in "abcdefghijklmnopqrstuvwxyz":
                        if c == original:
                            continue
                        chars[i] = c
                        nxt = "".join(chars)
                        if nxt in unvisited:
                            unvisited.remove(nxt)  # mark visited when we enqueue, not when we pop
                            queue.append(nxt)
                    chars[i] = original  # undo before moving to the next position
            steps += 1

        return 0
