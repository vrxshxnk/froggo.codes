class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Binary search the shorter array: O(log(min(m, n))), and j never goes out of range.
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.length, n = nums2.length;
        int half = (m + n + 1) / 2; // left half gets the extra element when the total is odd

        int lo = 0, hi = m; // i = how many elements of nums1 go to the left half
        while (lo <= hi) {
            int i = lo + (hi - lo) / 2;
            int j = half - i; // the rest of the left half comes from nums2

            // Neighbours of the two cuts. An empty side acts as -inf / +inf.
            long left1 = i > 0 ? nums1[i - 1] : Long.MIN_VALUE;
            long right1 = i < m ? nums1[i] : Long.MAX_VALUE;
            long left2 = j > 0 ? nums2[j - 1] : Long.MIN_VALUE;
            long right2 = j < n ? nums2[j] : Long.MAX_VALUE;

            if (left1 <= right2 && left2 <= right1) {
                // Every left element <= every right element: this is the median cut.
                if ((m + n) % 2 == 1) return (double) Math.max(left1, left2);
                return (Math.max(left1, left2) + Math.min(right1, right2)) / 2.0;
            }
            if (left1 > right2) hi = i - 1; // took too many from nums1
            else lo = i + 1;                // took too few from nums1
        }
        return 0.0; // inputs are sorted, so a valid cut always exists
    }
}
