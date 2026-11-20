struct TrieNode {
    TrieNode* children[2] = {};  // children[0] for bit 0, children[1] for bit 1
};

class Solution {
public:
    int findMaximumXOR(vector<int>& nums) {
        // Binary trie over the 31 bits of each number, highest bit first
        TrieNode* root = new TrieNode();
        int best = 0;
        for (int x : nums) {
            // Insert x first, so the trie is never empty when we query it
            TrieNode* node = root;
            for (int bit = 30; bit >= 0; bit--) {
                int b = (x >> bit) & 1;
                if (node->children[b] == nullptr) {
                    node->children[b] = new TrieNode();
                }
                node = node->children[b];
            }

            // Walk down choosing the OPPOSITE bit whenever we can: a 1 at a high
            // bit beats any combination of lower bits, so greedy is safe
            node = root;
            int cur = 0;
            for (int bit = 30; bit >= 0; bit--) {
                int b = (x >> bit) & 1;
                if (node->children[1 - b] != nullptr) {
                    cur |= 1 << bit;
                    node = node->children[1 - b];
                } else {
                    node = node->children[b];  // always exists: x itself took this path
                }
            }
            best = max(best, cur);
        }
        return best;
    }
};
