struct TrieNode {
    TrieNode* children[26] = {};  // children[c - 'a']
    vector<int> top;              // indices of the (at most 3) smallest products below this node
};

class Solution {
public:
    vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
        // Insert in sorted order, so the first 3 words to pass through a node
        // are exactly its 3 lexicographically smallest completions
        sort(products.begin(), products.end());

        TrieNode* root = new TrieNode();
        for (int idx = 0; idx < (int)products.size(); idx++) {
            TrieNode* node = root;
            for (char ch : products[idx]) {
                int i = ch - 'a';
                if (node->children[i] == nullptr) {
                    node->children[i] = new TrieNode();
                }
                node = node->children[i];
                if (node->top.size() < 3) {
                    node->top.push_back(idx);
                }
            }
        }

        vector<vector<string>> result;
        TrieNode* node = root;
        for (char ch : searchWord) {
            // Once the typed prefix leaves the trie, it stays gone for every longer prefix
            if (node != nullptr) {
                node = node->children[ch - 'a'];
            }
            vector<string> row;
            if (node != nullptr) {
                for (int i : node->top) row.push_back(products[i]);
            }
            result.push_back(row);
        }
        return result;
    }
};
