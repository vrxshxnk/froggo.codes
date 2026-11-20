class DSU {
    int[] parent, size;

    DSU(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;  // every node starts as its own root
            size[i] = 1;
        }
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

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;  // already in the same group
        if (size[ra] < size[rb]) {   // union by size: smaller tree under the bigger
            int t = ra; ra = rb; rb = t;
        }
        parent[rb] = ra;
        size[ra] += size[rb];
        return true;
    }
}

class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        // heights are a permutation of 0..n*n-1, so we can find "the cell of height t" directly
        int[] cellAt = new int[n * n];
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) cellAt[grid[r][c]] = r * n + c;

        DSU dsu = new DSU(n * n); // cell (r, c) is node r * n + c
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        for (int t = 0; t < n * n; t++) {
            // at time t exactly one new cell goes underwater: join it to flooded neighbours
            int r = cellAt[t] / n, c = cellAt[t] % n;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] <= t) {
                    dsu.union(r * n + c, nr * n + nc);
                }
            }
            if (dsu.find(0) == dsu.find(n * n - 1)) return t; // first moment they meet
        }

        return n * n - 1; // unreachable: by the last time every cell is flooded
    }
}
