class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        // Search over speeds, not indices. "Speed k finishes in time" goes F F F T T T,
        // so we want the first T. hi = max(piles) always works (1 hour per pile).
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;  // (lo + hi) could pass 2^31 - 1
            long hours = 0;                // can reach 1e4 * 1e9 = 1e13
            for (int p : piles) {
                hours += ((long) p + mid - 1) / mid;  // ceil(p / mid), in 64-bit
            }
            if (hours <= h) {
                hi = mid;      // mid works; something slower might too
            } else {
                lo = mid + 1;  // mid is too slow, and so is everything below it
            }
        }
        return lo;
    }
}
