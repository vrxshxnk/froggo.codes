class TrieNode:
    def __init__(self):
        self.children = {}   # letter -> TrieNode
        self.top = []        # indices of the (at most 3) smallest products below this node


class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        # Insert in sorted order, so the first 3 words to pass through a node
        # are exactly its 3 lexicographically smallest completions
        products.sort()

        root = TrieNode()
        for idx, word in enumerate(products):
            node = root
            for ch in word:
                if ch not in node.children:
                    node.children[ch] = TrieNode()
                node = node.children[ch]
                if len(node.top) < 3:
                    node.top.append(idx)

        result = []
        node = root
        for ch in searchWord:
            # Once the typed prefix leaves the trie, it stays gone for every longer prefix
            if node is not None:
                node = node.children.get(ch)
            result.append([] if node is None else [products[i] for i in node.top])
        return result
