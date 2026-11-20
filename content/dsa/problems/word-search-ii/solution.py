class TrieNode:
    def __init__(self):
        self.children = {}   # letter -> TrieNode
        self.word = None     # the whole word that ends at this node, if any


class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = TrieNode()
        for w in words:
            node = root
            for ch in w:
                if ch not in node.children:
                    node.children[ch] = TrieNode()
                node = node.children[ch]
            node.word = w   # store the word itself, so we never rebuild it from the path

        rows, cols = len(board), len(board[0])
        found = []

        def dfs(r: int, c: int, parent: TrieNode) -> None:
            ch = board[r][c]
            node = parent.children[ch]
            if node.word is not None:
                found.append(node.word)
                node.word = None            # report each word once, even if it appears twice

            board[r][c] = "#"               # mark visited; "#" is never a trie key
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                # Only step where the trie says some word can continue
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node.children:
                    dfs(nr, nc, node)
            board[r][c] = ch                # un-mark for other paths

            # Prune: a node with no words left below it can never help again
            if not node.children and node.word is None:
                del parent.children[ch]

        for r in range(rows):
            for c in range(cols):
                if board[r][c] in root.children:
                    dfs(r, c, root)
        return found
