class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap by default: the k largest so far
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) {
                heap.poll();     // the smallest of k + 1 can't be in the top k
            }
        }
        return heap.peek();      // smallest of the top k = the k-th largest
    }
}
