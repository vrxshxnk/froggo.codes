class DSU {
public:
    vector<int> parent, sz;

    DSU(int n) : parent(n), sz(n, 1) {
        iota(parent.begin(), parent.end(), 0);  // every city starts as its own root
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
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        DSU dsu(n);
        int provinces = n;  // start with n separate cities

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {  // symmetric matrix: upper half is enough
                if (isConnected[i][j] == 1 && dsu.unite(i, j)) {
                    provinces--;               // each successful merge joins two groups
                }
            }
        }

        return provinces;
    }
};
