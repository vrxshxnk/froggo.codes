struct TrieNode {
    unordered_map<char, TrieNode*> children;  // letter -> child
    string word;                              // the whole word that ends here ("" if none)
};

class Solution {
    int rows = 0, cols = 0;
    vector<string> found;

    void dfs(vector<vector<char>>& board, int r, int c, TrieNode* parent) {
        char ch = board[r][c];
        TrieNode* node = parent->children[ch];
        if (!node->word.empty()) {
            found.push_back(node->word);
            node->word.clear();  // report each word once, even if it appears twice
        }

        board[r][c] = '#';  // mark visited; '#' is never a trie key
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            // Only step where the trie says some word can continue
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && node->children.count(board[nr][nc])) {
                dfs(board, nr, nc, node);
            }
        }
        board[r][c] = ch;  // un-mark for other paths

        // Prune: a node with no words left below it can never help again
        if (node->children.empty() && node->word.empty()) {
            parent->children.erase(ch);
            delete node;
        }
    }

public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        TrieNode* root = new TrieNode();
        for (const string& w : words) {
            TrieNode* node = root;
            for (char ch : w) {
                if (!node->children.count(ch)) {
                    node->children[ch] = new TrieNode();
                }
                node = node->children[ch];
            }
            node->word = w;  // store the word itself, so we never rebuild it from the path
        }

        rows = board.size();
        cols = board[0].size();
        found.clear();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (root->children.count(board[r][c])) {
                    dfs(board, r, c, root);
                }
            }
        }
        return found;
    }
};
