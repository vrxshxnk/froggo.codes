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
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        DSU dsu(edges.size() + 1);  // nodes are labelled 1..n, and n == edges.size()

        for (auto& e : edges) {
            if (!dsu.unite(e[0], e[1])) {
                // already connected: this edge closes the cycle, and it's the
                // last cycle edge in input order
                return {e[0], e[1]};
            }
        }

        return {};  // exactly one extra edge is guaranteed, never reached
    }
};
