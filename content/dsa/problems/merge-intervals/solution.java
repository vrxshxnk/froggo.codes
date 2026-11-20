class Solution {
    public int[][] merge(int[][] intervals) {
        // after sorting by start, anything that overlaps the current block is right next to it
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();

        for (int[] iv : intervals) {
            if (!merged.isEmpty() && iv[0] <= merged.get(merged.size() - 1)[1]) {
                // overlaps (or touches) the last block: stretch it, but never shrink it
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], iv[1]);
            } else {
                merged.add(new int[] { iv[0], iv[1] }); // a gap: start a new block
            }
        }

        return merged.toArray(new int[0][]);
    }
}
