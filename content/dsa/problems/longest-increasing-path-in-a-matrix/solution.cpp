class Solution {
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        rows = matrix.size();
        cols = matrix[0].size();
        // memo[r][c] = longest increasing path STARTING at (r, c); 0 = not computed.
        // Strictly increasing paths can never loop back, so this never changes once known.
        memo.assign(rows, vector<int>(cols, 0));

        int best = 0;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                best = max(best, dfs(matrix, r, c));
        return best;
    }

private:
    int rows, cols;
    vector<vector<int>> memo;
    const int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    int dfs(vector<vector<int>>& matrix, int r, int c) {
        if (memo[r][c]) return memo[r][c];
        int best = 1;  // the cell on its own
        for (auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c])
                best = max(best, 1 + dfs(matrix, nr, nc));
        }
        return memo[r][c] = best;
    }
};
