class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<int> best(n, INT_MAX);  // best[v] = cheapest edge from the tree to point v so far
        vector<bool> inTree(n, false);
        best[0] = 0;                   // start the tree at point 0 for free
        int total = 0;

        for (int step = 0; step < n; step++) {
            // Prim: grab the point outside the tree with the cheapest connection
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!inTree[i] && (u == -1 || best[i] < best[u])) u = i;
            }
            inTree[u] = true;
            total += best[u];

            // u just joined, so it may offer a cheaper edge to the points still outside
            for (int v = 0; v < n; v++) {
                if (!inTree[v]) {
                    int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                    best[v] = min(best[v], d);
                }
            }
        }

        return total;
    }
};
