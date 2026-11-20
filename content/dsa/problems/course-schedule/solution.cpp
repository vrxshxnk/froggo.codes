class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        // Adjacency list: graph[b] lists the courses that b unlocks (edge b -> a)
        vector<vector<int>> graph(numCourses);
        vector<int> indegree(numCourses, 0);  // how many prerequisites each course still waits on
        for (auto& p : prerequisites) {
            graph[p[1]].push_back(p[0]);
            indegree[p[0]]++;
        }

        // Kahn's algorithm: start with every course that needs nothing
        queue<int> q;
        for (int c = 0; c < numCourses; c++)
            if (indegree[c] == 0) q.push(c);

        int taken = 0;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            taken++;
            for (int nxt : graph[course]) {
                if (--indegree[nxt] == 0) q.push(nxt);  // all of nxt's prerequisites are done
            }
        }

        // Courses on a cycle never reach indegree 0, so they are never taken
        return taken == numCourses;
    }
};
