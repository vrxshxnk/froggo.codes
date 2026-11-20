class KthLargest {
    private final int k;
    // Java's PriorityQueue is a min-heap by default, which is exactly what we want
    private final PriorityQueue<Integer> heap = new PriorityQueue<>(); // the k largest so far

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) add(x);
    }

    public int add(int val) {
        heap.offer(val);
        if (heap.size() > k) {
            heap.poll();         // drop the smallest: it can never be the k-th largest again
        }
        return heap.peek();      // smallest of the top k = the k-th largest
    }
}
