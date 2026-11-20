class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        const int dr[4] = {1, -1, 0, 0};  // down, up, right, left
        const int dc[4] = {0, 0, 1, -1};
        int best = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1) continue;
                // New island: count its cells with an iterative DFS (an explicit stack, no recursion)
                int area = 0;
                grid[r][c] = 0;                // mark when pushed, so no cell is counted twice
                vector<pair<int, int>> st = {{r, c}};
                while (!st.empty()) {
                    auto [cr, cc] = st.back();
                    st.pop_back();
                    area++;
                    for (int d = 0; d < 4; d++) {
                        int nr = cr + dr[d], nc = cc + dc[d];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                            grid[nr][nc] = 0;
                            st.push_back({nr, nc});
                        }
                    }
                }
                best = max(best, area);
            }
        }
        return best;
    }
};
