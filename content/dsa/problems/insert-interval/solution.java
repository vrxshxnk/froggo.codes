class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int i = 0, n = intervals.length;
        int start = newInterval[0], end = newInterval[1];

        // 1. intervals that finish before the new one starts: copy them unchanged
        while (i < n && intervals[i][1] < start) {
            result.add(intervals[i]);
            i++;
        }

        // 2. intervals that start before the new one ends overlap it: absorb them
        while (i < n && intervals[i][0] <= end) {
            start = Math.min(start, intervals[i][0]);
            end = Math.max(end, intervals[i][1]);
            i++;
        }
        result.add(new int[] { start, end });

        // 3. everything left starts after the merged block ends: copy unchanged
        while (i < n) {
            result.add(intervals[i]);
            i++;
        }

        return result.toArray(new int[0][]);
    }
}
