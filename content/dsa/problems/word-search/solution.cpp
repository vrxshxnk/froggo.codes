class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size(), cols = board[0].size();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }

private:
    // Can word[k..] be spelled starting at cell (r, c)?
    bool dfs(vector<vector<char>>& board, const string& word, int r, int c, int k) {
        if (board[r][c] != word[k]) return false;
        if (k == (int)word.size() - 1) return true;  // matched the last letter

        static const int dr[4] = {1, -1, 0, 0};       // down, up, right, left
        static const int dc[4] = {0, 0, 1, -1};
        int rows = board.size(), cols = board[0].size();

        char saved = board[r][c];
        board[r][c] = '#';           // choose: mark visited so this path can't reuse the cell
        bool found = false;
        for (int d = 0; d < 4 && !found; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && dfs(board, word, nr, nc, k + 1))
                found = true;
        }
        board[r][c] = saved;         // un-choose: other paths may still use this cell
        return found;
    }
};
