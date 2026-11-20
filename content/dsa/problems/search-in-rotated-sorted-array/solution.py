class Solution:
    def search(self, nums: List[int], target: int) -> int:
        n = len(nums)
        last = nums[-1]

        # Step 1: the pivot is the first index with nums[i] <= last (the minimum).
        # Left of it every value is > last; from it onwards every value is <= last.
        lo, hi = 0, n - 1                # the last index is always T
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] <= last:
                hi = mid
            else:
                lo = mid + 1
        pivot = lo

        # Step 2: comparing with last tells us which sorted piece can hold target.
        if target <= last:
            lo, hi = pivot, n            # right piece [pivot, n)
        else:
            lo, hi = 0, pivot            # left piece [0, pivot); empty if not rotated
        end = hi                         # this piece's past-the-end slot

        # Step 3: ordinary lower bound on that piece.
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] >= target:
                hi = mid
            else:
                lo = mid + 1

        if lo < end and nums[lo] == target:
            return lo
        return -1
