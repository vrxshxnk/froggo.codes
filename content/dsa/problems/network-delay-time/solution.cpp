class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> graph(n + 1);  // graph[u] = (v, w), nodes are 1..n
        for (auto& t : times) graph[t[0]].push_back({t[1], t[2]});

        vector<int> dist(n + 1, -1);  // -1 = not settled yet
        // min-heap of (time to reach node, node)
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;
        heap.push({0, k});
        int settled = 0, answer = 0;

        while (!heap.empty()) {
            auto [d, u] = heap.top();
            heap.pop();
            if (dist[u] != -1) continue;  // stale entry: u already settled with a smaller time
            dist[u] = d;                  // smallest time in the heap is final (weights >= 0)
            settled++;
            answer = max(answer, d);
            for (auto [v, w] : graph[u]) {
                if (dist[v] == -1) heap.push({d + w, v});
            }
        }

        // every node must hear the signal; the last one to hear it sets the answer
        return settled == n ? answer : -1;
    }
};
