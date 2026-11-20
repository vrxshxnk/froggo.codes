class Solution {
    public int lengthOfLIS(int[] nums) {
        // tails[k] = the smallest value that can end an increasing subsequence of length k + 1
        // (tails[0..size-1] is always strictly increasing, so we can binary search it)
        int[] tails = new int[nums.length];
        int size = 0;

        for (int x : nums) {
            // k = first slot whose tail is >= x; x can extend every length before slot k,
            // so the longest increasing subsequence ending at x has length k + 1 (that's dp[i])
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < x) lo = mid + 1;
                else hi = mid;
            }
            int k = lo;
            tails[k] = x;                // same length, smaller ending: easier to extend later
            if (k == size) size++;       // x beat every tail: a new, longer length
        }

        return size;
    }
}
