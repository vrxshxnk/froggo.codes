class Solution {
    public int lastStoneWeight(int[] stones) {
        // PriorityQueue is a MIN-heap by default; reverseOrder() makes the heaviest come out first
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int s : stones) heap.offer(s);

        while (heap.size() > 1) {
            int y = heap.poll(); // heaviest
            int x = heap.poll(); // second heaviest, so x <= y
            if (y != x) {
                heap.offer(y - x); // the leftover piece goes back in
            }
        }

        return heap.isEmpty() ? 0 : heap.peek();
    }
}
