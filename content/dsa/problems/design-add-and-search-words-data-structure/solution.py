class TrieNode:
    def __init__(self):
        self.children = {}    # letter -> TrieNode
        self.is_end = False   # does a whole added word stop here?


class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        def dfs(node: TrieNode, i: int) -> bool:
            if i == len(word):
                return node.is_end              # used every letter: is a word ending here?
            ch = word[i]
            if ch == ".":
                # A dot can be any letter, so try every branch that exists
                for child in node.children.values():
                    if dfs(child, i + 1):
                        return True
                return False
            child = node.children.get(ch)       # a real letter has only one way forward
            return child is not None and dfs(child, i + 1)

        return dfs(self.root, 0)
