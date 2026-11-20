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
    public int[] findRedundantConnection(int[][] edges) {
        DSU dsu = new DSU(edges.length + 1); // nodes are labelled 1..n, and n == edges.length

        for (int[] e : edges) {
            if (!dsu.union(e[0], e[1])) {
                // already connected: this edge closes the cycle, and it's the
                // last cycle edge in input order
                return new int[] { e[0], e[1] };
            }
        }

        return new int[0]; // exactly one extra edge is guaranteed, never reached
    }
}
