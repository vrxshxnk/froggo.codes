class Solution {
    public int search(int[] nums, int target) {
        int n = nums.length;
        int last = nums[n - 1];

        // Step 1: the pivot is the first index with nums[i] <= last (the minimum).
        // Left of it every value is > last; from it onwards every value is <= last.
        int lo = 0, hi = n - 1;  // the last index is always T
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] <= last) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        int pivot = lo;

        // Step 2: comparing with last tells us which sorted piece can hold target.
        if (target <= last) {
            lo = pivot; hi = n;  // right piece [pivot, n)
        } else {
            lo = 0; hi = pivot;  // left piece [0, pivot); empty if not rotated
        }
        int end = hi;            // this piece's past-the-end slot

        // Step 3: ordinary lower bound on that piece.
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] >= target) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }

        if (lo < end && nums[lo] == target) return lo;
        return -1;
    }
}
