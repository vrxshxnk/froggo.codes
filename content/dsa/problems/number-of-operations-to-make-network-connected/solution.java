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
    public int makeConnected(int n, int[][] connections) {
        // n computers need at least n - 1 cables to be connected at all
        if (connections.length < n - 1) return -1;

        DSU dsu = new DSU(n);
        int components = n;
        for (int[] c : connections) {
            if (dsu.union(c[0], c[1])) components--;
        }

        // we have enough spare cables, so joining k islands costs k - 1 moves
        return components - 1;
    }
}
