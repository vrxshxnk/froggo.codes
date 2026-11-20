class DSU {
public:
    vector<int> parent, sz;

    DSU(int n) : parent(n), sz(n, 1) {
        iota(parent.begin(), parent.end(), 0);  // every node starts as its own root
    }

    int find(int x) {
        int root = x;
        while (parent[root] != root) root = parent[root];
        // path compression: point every node we walked past straight at the root
        while (x != root) {
            int nxt = parent[x];
            parent[x] = root;
            x = nxt;
        }
        return root;
    }

    // "union" is a C++ keyword, so this one is called unite
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;          // already in the same group
        if (sz[ra] < sz[rb]) swap(ra, rb);   // union by size: smaller tree under the bigger
        parent[rb] = ra;
        sz[ra] += sz[rb];
        return true;
    }
};

class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        // heights are a permutation of 0..n*n-1, so we can find "the cell of height t" directly
        vector<int> cellAt(n * n);
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) cellAt[grid[r][c]] = r * n + c;

        DSU dsu(n * n);  // cell (r, c) is node r * n + c
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        for (int t = 0; t < n * n; t++) {
            // at time t exactly one new cell goes underwater: join it to flooded neighbours
            int r = cellAt[t] / n, c = cellAt[t] % n;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] <= t) {
                    dsu.unite(r * n + c, nr * n + nc);
                }
            }
            if (dsu.find(0) == dsu.find(n * n - 1)) return t;  // first moment they meet
        }

        return n * n - 1;  // unreachable: by the last time every cell is flooded
    }
};
