class Solution {
    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>(); // letter -> child
        String word = null;                                   // the whole word that ends here, if any
    }

    private static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    private int rows, cols;
    private List<String> found;

    public List<String> findWords(char[][] board, String[] words) {
        TrieNode root = new TrieNode();
        for (String w : words) {
            TrieNode node = root;
            for (char ch : w.toCharArray()) {
                node = node.children.computeIfAbsent(ch, k -> new TrieNode());
            }
            node.word = w; // store the word itself, so we never rebuild it from the path
        }

        rows = board.length;
        cols = board[0].length;
        found = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (root.children.containsKey(board[r][c])) {
                    dfs(board, r, c, root);
                }
            }
        }
        return found;
    }

    private void dfs(char[][] board, int r, int c, TrieNode parent) {
        char ch = board[r][c];
        TrieNode node = parent.children.get(ch);
        if (node.word != null) {
            found.add(node.word);
            node.word = null; // report each word once, even if it appears twice
        }

        board[r][c] = '#'; // mark visited; '#' is never a trie key
        for (int[] d : DIRS) {
            int nr = r + d[0], nc = c + d[1];
            // Only step where the trie says some word can continue
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && node.children.containsKey(board[nr][nc])) {
                dfs(board, nr, nc, node);
            }
        }
        board[r][c] = ch; // un-mark for other paths

        // Prune: a node with no words left below it can never help again
        if (node.children.isEmpty() && node.word == null) {
            parent.children.remove(ch);
        }
    }
}
