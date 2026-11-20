class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int rows = heights.size(), cols = heights[0].size();
        vector<pair<int, int>> pacificShore, atlanticShore;
        for (int c = 0; c < cols; c++) {
            pacificShore.push_back({0, c});
            atlanticShore.push_back({rows - 1, c});
        }
        for (int r = 0; r < rows; r++) {
            pacificShore.push_back({r, 0});
            atlanticShore.push_back({r, cols - 1});
        }
        vector<vector<bool>> pacific = reachable(heights, pacificShore);
        vector<vector<bool>> atlantic = reachable(heights, atlanticShore);

        vector<vector<int>> result;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pacific[r][c] && atlantic[r][c]) result.push_back({r, c});
        return result;
    }

private:
    // Multi-source BFS from an ocean's shore, walking UPHILL (water flowing backwards).
    vector<vector<bool>> reachable(const vector<vector<int>>& heights, const vector<pair<int, int>>& starts) {
        int rows = heights.size(), cols = heights[0].size();
        const int dr[4] = {1, -1, 0, 0};  // down, up, right, left
        const int dc[4] = {0, 0, 1, -1};
        vector<vector<bool>> seen(rows, vector<bool>(cols, false));
        queue<pair<int, int>> q;
        for (auto [r, c] : starts) {
            if (!seen[r][c]) {
                seen[r][c] = true;
                q.push({r, c});
            }
        }
        while (!q.empty()) {
            auto [r, c] = q.front();
            q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc]
                    && heights[nr][nc] >= heights[r][c]) {  // water could flow nr,nc -> r,c
                    seen[nr][nc] = true;
                    q.push({nr, nc});
                }
            }
        }
        return seen;
    }
};
