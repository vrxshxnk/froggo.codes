class Trie {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26]; // children[c - 'a'], null if no word continues with c
        boolean isEnd = false;                  // does a whole inserted word stop here?
    }

    private final TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) {
                node.children[i] = new TrieNode(); // create only the missing part of the path
            }
            node = node.children[i];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = walk(word);
        // The path existing is not enough: "app" is a path inside "apple"
        return node != null && node.isEnd;
    }

    public boolean startsWith(String prefix) {
        // For a prefix, the path existing IS enough
        return walk(prefix) != null;
    }

    // Follow s letter by letter; null means we fell off the tree
    private TrieNode walk(String s) {
        TrieNode node = root;
        for (char ch : s.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) return null;
        }
        return node;
    }
}
