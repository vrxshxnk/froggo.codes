class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] count = new int[26];
        for (char t : tasks) count[t - 'A']++;

        int maxCount = 0; // the busiest task sets the skeleton
        for (int c : count) maxCount = Math.max(maxCount, c);
        int numMax = 0;   // tasks tied for busiest share the last row
        for (int c : count) {
            if (c == maxCount) numMax++;
        }

        // (maxCount - 1) full rows of width n + 1, then one last row holding the tied tasks.
        int frame = (maxCount - 1) * (n + 1) + numMax;
        // If there are more tasks than slots, no idling is ever needed.
        return Math.max(frame, tasks.length);
    }
}
