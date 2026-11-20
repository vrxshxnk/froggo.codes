class TrieNode:
    def __init__(self):
        self.children = {}    # letter -> TrieNode
        self.is_end = False   # does a whole inserted word stop here?


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()   # create only the missing part of the path
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._walk(word)
        # The path existing is not enough: "app" is a path inside "apple"
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        # For a prefix, the path existing IS enough
        return self._walk(prefix) is not None

    def _walk(self, s: str) -> Optional[TrieNode]:
        # Follow s letter by letter; None means we fell off the tree
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node
