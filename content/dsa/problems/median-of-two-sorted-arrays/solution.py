class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        # Binary search the shorter array, so the search is O(log(min(m, n)))
        # and the cut in the longer array always lands inside it.
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        m, n = len(nums1), len(nums2)
        half = (m + n + 1) // 2  # size of the left half (gets the extra element when the total is odd)

        lo, hi = 0, m  # i = how many elements of nums1 go to the left half
        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i  # the rest of the left half comes from nums2

            # Neighbours of the two cuts. An empty side acts as -inf / +inf.
            left1 = nums1[i - 1] if i > 0 else float("-inf")
            right1 = nums1[i] if i < m else float("inf")
            left2 = nums2[j - 1] if j > 0 else float("-inf")
            right2 = nums2[j] if j < n else float("inf")

            if left1 <= right2 and left2 <= right1:
                # Every left element <= every right element: this is the median cut.
                if (m + n) % 2 == 1:
                    return float(max(left1, left2))
                return (max(left1, left2) + min(right1, right2)) / 2
            if left1 > right2:
                hi = i - 1  # took too many from nums1
            else:
                lo = i + 1  # took too few from nums1

        return 0.0  # inputs are sorted, so a valid cut always exists
