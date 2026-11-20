class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> s = new HashSet<>();
        for (int x : nums) s.add(x);
        int best = 0;

        for (int x : s) {                         // iterate the SET, not the array
            if (s.contains(x - 1)) continue;      // not the start of a run

            int length = 1;
            while (s.contains(x + length)) length++; // count upward from the start
            best = Math.max(best, length);
        }

        return best;
    }
}
