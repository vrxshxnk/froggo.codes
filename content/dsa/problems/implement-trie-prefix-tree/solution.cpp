struct TrieNode {
    TrieNode* children[26] = {};  // children[c - 'a'], nullptr if no word continues with c
    bool isEnd = false;           // does a whole inserted word stop here?
};

class Trie {
    TrieNode* root;

    // Follow s letter by letter; nullptr means we fell off the tree
    TrieNode* walk(const string& s) {
        TrieNode* node = root;
        for (char ch : s) {
            node = node->children[ch - 'a'];
            if (node == nullptr) return nullptr;
        }
        return node;
    }

public:
    Trie() {
        root = new TrieNode();
    }

    void insert(string word) {
        TrieNode* node = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (node->children[i] == nullptr) {
                node->children[i] = new TrieNode();  // create only the missing part of the path
            }
            node = node->children[i];
        }
        node->isEnd = true;
    }

    bool search(string word) {
        TrieNode* node = walk(word);
        // The path existing is not enough: "app" is a path inside "apple"
        return node != nullptr && node->isEnd;
    }

    bool startsWith(string prefix) {
        // For a prefix, the path existing IS enough
        return walk(prefix) != nullptr;
    }
};
