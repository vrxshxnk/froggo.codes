class WordDictionary {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26]; // children[c - 'a'], null if no word continues with c
        boolean isEnd = false;                  // does a whole added word stop here?
    }

    private final TrieNode root;

    public WordDictionary() {
        root = new TrieNode();
    }

    public void addWord(String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) {
                node.children[i] = new TrieNode();
            }
            node = node.children[i];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(root, word, 0);
    }

    private boolean dfs(TrieNode node, String word, int i) {
        if (i == word.length()) {
            return node.isEnd; // used every letter: is a word ending here?
        }
        char ch = word.charAt(i);
        if (ch == '.') {
            // A dot can be any letter, so try every branch that exists
            for (TrieNode child : node.children) {
                if (child != null && dfs(child, word, i + 1)) return true;
            }
            return false;
        }
        TrieNode child = node.children[ch - 'a']; // a real letter has only one way forward
        return child != null && dfs(child, word, i + 1);
    }
}
