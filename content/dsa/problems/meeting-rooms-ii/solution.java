class Solution {
    public int minMeetingRooms(int[][] intervals) {
        // handle meetings in the order they start
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> ends = new PriorityQueue<>(); // min-heap: end time per room in use

        for (int[] m : intervals) {
            // The room that frees up first is on top. If it is free by now, reuse it.
            // "<=" because a meeting ending at 10 frees its room for one starting at 10.
            if (!ends.isEmpty() && ends.peek() <= m[0]) {
                ends.poll();
            }
            ends.offer(m[1]);
        }

        return ends.size(); // never shrinks, so its final size is the most rooms ever in use
    }
}
