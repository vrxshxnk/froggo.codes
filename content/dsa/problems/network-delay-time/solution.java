class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> graph = new ArrayList<>(); // graph.get(u) = {v, w}, nodes are 1..n
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] t : times) graph.get(t[0]).add(new int[] { t[1], t[2] });

        int[] dist = new int[n + 1];
        Arrays.fill(dist, -1); // -1 = not settled yet
        // min-heap of {time to reach node, node}
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, k });
        int settled = 0, answer = 0;

        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int d = top[0], u = top[1];
            if (dist[u] != -1) continue; // stale entry: u already settled with a smaller time
            dist[u] = d;                 // smallest time in the heap is final (weights >= 0)
            settled++;
            answer = Math.max(answer, d);
            for (int[] edge : graph.get(u)) {
                if (dist[edge[0]] == -1) heap.add(new int[] { d + edge[1], edge[0] });
            }
        }

        // every node must hear the signal; the last one to hear it sets the answer
        return settled == n ? answer : -1;
    }
}
