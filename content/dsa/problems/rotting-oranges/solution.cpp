class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        const int dr[4] = {1, -1, 0, 0};  // down, up, right, left
        const int dc[4] = {0, 0, 1, -1};

        // Multi-source BFS: every rotten orange starts in the queue at minute 0
        queue<pair<int, int>> q;
        int fresh = 0;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }

        int minutes = 0;
        while (!q.empty() && fresh > 0) {
            // Everything in the queue right now rotted at the same minute: process that whole level
            int levelSize = q.size();
            for (int i = 0; i < levelSize; i++) {
                auto [r, c] = q.front();
                q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;      // rot it now, so it is queued only once
                        fresh--;
                        q.push({nr, nc});
                    }
                }
            }
            minutes++;
        }

        return fresh == 0 ? minutes : -1;
    }
};
