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
    int makeConnected(int n, vector<vector<int>>& connections) {
        // n computers need at least n - 1 cables to be connected at all
        if ((int)connections.size() < n - 1) return -1;

        DSU dsu(n);
        int components = n;
        for (auto& c : connections) {
            if (dsu.unite(c[0], c[1])) components--;
        }

        // we have enough spare cables, so joining k islands costs k - 1 moves
        return components - 1;
    }
};
