class Solution:
    def search(self, nums: List[int], target: int) -> int:
        # Find the first index with nums[i] >= target (the lower bound).
        # Invariant: that index is always inside [lo, hi]; hi = n means "past the end".
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] >= target:
                hi = mid          # mid might be the answer, so keep it
            else:
                lo = mid + 1      # mid and everything left of it are too small

        # lo is where target would sit; it's only a match if it's really there
        if lo < len(nums) and nums[lo] == target:
            return lo
        return -1
