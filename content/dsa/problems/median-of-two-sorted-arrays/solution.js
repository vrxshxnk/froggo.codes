/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
  // Binary search the shorter array: O(log(min(m, n))), and j never goes out of range.
  if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];
  const m = nums1.length, n = nums2.length;
  const half = Math.floor((m + n + 1) / 2); // left half gets the extra element when the total is odd

  let lo = 0, hi = m; // i = how many elements of nums1 go to the left half
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = half - i; // the rest of the left half comes from nums2

    // Neighbours of the two cuts. An empty side acts as -Infinity / +Infinity.
    const left1 = i > 0 ? nums1[i - 1] : -Infinity;
    const right1 = i < m ? nums1[i] : Infinity;
    const left2 = j > 0 ? nums2[j - 1] : -Infinity;
    const right2 = j < n ? nums2[j] : Infinity;

    if (left1 <= right2 && left2 <= right1) {
      // Every left element <= every right element: this is the median cut.
      if ((m + n) % 2 === 1) return Math.max(left1, left2);
      return (Math.max(left1, left2) + Math.min(right1, right2)) / 2;
    }
    if (left1 > right2) hi = i - 1; // took too many from nums1
    else lo = i + 1;                // took too few from nums1
  }
  return 0; // inputs are sorted, so a valid cut always exists
};
