class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Adjacency list: graph.get(b) lists the courses that b unlocks (edge b -> a)
        List<List<Integer>> graph = new ArrayList<>();
        for (int c = 0; c < numCourses; c++) graph.add(new ArrayList<>());
        int[] indegree = new int[numCourses]; // how many prerequisites each course still waits on
        for (int[] p : prerequisites) {
            graph.get(p[1]).add(p[0]);
            indegree[p[0]]++;
        }

        // Kahn's algorithm: start with every course that needs nothing
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        for (int c = 0; c < numCourses; c++)
            if (indegree[c] == 0) queue.add(c);

        int taken = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            taken++;
            for (int nxt : graph.get(course)) {
                if (--indegree[nxt] == 0) queue.add(nxt); // all of nxt's prerequisites are done
            }
        }

        // Courses on a cycle never reach indegree 0, so they are never taken
        return taken == numCourses;
    }
}
