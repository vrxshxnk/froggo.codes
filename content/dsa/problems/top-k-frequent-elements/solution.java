class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>(); // value -> how many times
        for (int x : nums) count.merge(x, 1, Integer::sum);

        int n = nums.length;
        List<List<Integer>> buckets = new ArrayList<>(); // buckets[c] = values seen c times
        for (int i = 0; i <= n; i++) buckets.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> e : count.entrySet()) {
            buckets.get(e.getValue()).add(e.getKey());
        }

        int[] result = new int[k];
        int filled = 0;
        for (int c = n; c >= 1 && filled < k; c--) { // most frequent first
            for (int value : buckets.get(c)) {
                result[filled++] = value;
                if (filled == k) break;
            }
        }
        return result;
    }
}
