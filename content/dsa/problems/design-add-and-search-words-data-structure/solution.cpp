struct TrieNode {
    TrieNode* children[26] = {};  // children[c - 'a'], nullptr if no word continues with c
    bool isEnd = false;           // does a whole added word stop here?
};

class WordDictionary {
    TrieNode* root;

    bool dfs(TrieNode* node, const string& word, int i) {
        if (i == (int)word.size()) {
            return node->isEnd;  // used every letter: is a word ending here?
        }
        char ch = word[i];
        if (ch == '.') {
            // A dot can be any letter, so try every branch that exists
            for (TrieNode* child : node->children) {
                if (child != nullptr && dfs(child, word, i + 1)) return true;
            }
            return false;
        }
        TrieNode* child = node->children[ch - 'a'];  // a real letter has only one way forward
        return child != nullptr && dfs(child, word, i + 1);
    }

public:
    WordDictionary() {
        root = new TrieNode();
    }

    void addWord(string word) {
        TrieNode* node = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (node->children[i] == nullptr) {
                node->children[i] = new TrieNode();
            }
            node = node->children[i];
        }
        node->isEnd = true;
    }

    bool search(string word) {
        return dfs(root, word, 0);
    }
};
