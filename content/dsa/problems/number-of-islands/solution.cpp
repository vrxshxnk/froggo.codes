class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        const int dr[4] = {1, -1, 0, 0};  // down, up, right, left
        const int dc[4] = {0, 0, 1, -1};
        int islands = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                // Unvisited land: a new island. Flood all of it so we never count it again.
                islands++;
                grid[r][c] = '0';              // mark when we ADD to the queue, not when we pop
                queue<pair<int, int>> q;
                q.push({r, c});
                while (!q.empty()) {
                    auto [cr, cc] = q.front();
                    q.pop();
                    for (int d = 0; d < 4; d++) {
                        int nr = cr + dr[d], nc = cc + dc[d];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            q.push({nr, nc});
                        }
                    }
                }
            }
        }
        return islands;
    }
};
