class Solution {
    public int findMin(int[] nums) {
        // Everything before the drop is > last; the minimum and everything after it are <= last.
        // So "nums[i] <= last" goes F F F T T, and the first T is the minimum.
        int last = nums[nums.length - 1];
        int lo = 0, hi = nums.length - 1;  // the last index is always T
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] <= last) {
                hi = mid;      // mid is in the second run: the minimum is here or left
            } else {
                lo = mid + 1;  // mid is in the first run: the minimum is to the right
            }
        }
        return nums[lo];
    }
}
