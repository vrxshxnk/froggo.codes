class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        # Search over speeds, not indices. "Speed k finishes in time" goes F F F T T T,
        # so we want the first T. hi = max(piles) always works (1 hour per pile).
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = lo + (hi - lo) // 2
            hours = 0
            for p in piles:
                hours += (p + mid - 1) // mid   # ceil(p / mid): leftovers cost a whole hour
            if hours <= h:
                hi = mid          # mid works; something slower might too
            else:
                lo = mid + 1      # mid is too slow, and so is everything below it
        return lo
