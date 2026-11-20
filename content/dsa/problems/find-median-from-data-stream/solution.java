class MedianFinder {
    // low = smaller half (max-heap), high = larger half (min-heap).
    // Invariant: low.size() == high.size() or low.size() == high.size() + 1.
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    public MedianFinder() {}

    public void addNum(int num) {
        // Push through low first, so the largest of the small half moves up to
        // high. That keeps every element of low <= every element of high.
        low.offer(num);
        high.offer(low.poll());
        // Rebalance: low may be bigger by one, never smaller.
        if (high.size() > low.size()) low.offer(high.poll());
    }

    public double findMedian() {
        if (low.size() > high.size()) return low.peek(); // odd count: the middle is low's top
        return ((double) low.peek() + high.peek()) / 2.0; // cast first: the sum can overflow int
    }
}
