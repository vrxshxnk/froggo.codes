class Solution {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];     // children[c - 'a']
        List<Integer> top = new ArrayList<>();      // indices of the (at most 3) smallest products below this node
    }

    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        // Insert in sorted order, so the first 3 words to pass through a node
        // are exactly its 3 lexicographically smallest completions
        Arrays.sort(products);

        TrieNode root = new TrieNode();
        for (int idx = 0; idx < products.length; idx++) {
            TrieNode node = root;
            for (char ch : products[idx].toCharArray()) {
                int i = ch - 'a';
                if (node.children[i] == null) {
                    node.children[i] = new TrieNode();
                }
                node = node.children[i];
                if (node.top.size() < 3) {
                    node.top.add(idx);
                }
            }
        }

        List<List<String>> result = new ArrayList<>();
        TrieNode node = root;
        for (char ch : searchWord.toCharArray()) {
            // Once the typed prefix leaves the trie, it stays gone for every longer prefix
            if (node != null) {
                node = node.children[ch - 'a'];
            }
            List<String> row = new ArrayList<>();
            if (node != null) {
                for (int i : node.top) row.add(products[i]);
            }
            result.add(row);
        }
        return result;
    }
}
