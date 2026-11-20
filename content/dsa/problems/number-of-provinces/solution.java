class DSU {
    int[] parent, size;

    DSU(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;  // every city starts as its own root
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
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        DSU dsu = new DSU(n);
        int provinces = n; // start with n separate cities

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) { // symmetric matrix: upper half is enough
                if (isConnected[i][j] == 1 && dsu.union(i, j)) {
                    provinces--;              // each successful merge joins two groups
                }
            }
        }

        return provinces;
    }
}
