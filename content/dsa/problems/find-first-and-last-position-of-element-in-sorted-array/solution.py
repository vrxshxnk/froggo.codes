class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        n = len(nums)

        # Lower bound: first index with nums[i] >= target, i.e. the first copy.
        lo, hi = 0, n
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] >= target:
                hi = mid
            else:
                lo = mid + 1
        first = lo

        # Landing past the end, or on a bigger number, means target is missing
        if first == n or nums[first] != target:
            return [-1, -1]

        # Upper bound: first index with nums[i] > target, i.e. one PAST the last copy.
        lo, hi = 0, n
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] > target:       # the only change: > instead of >=
                hi = mid
            else:
                lo = mid + 1
        upper = lo

        return [first, upper - 1]
