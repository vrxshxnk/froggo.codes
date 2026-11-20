class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        total = m * n

        # Read row by row, the grid is one sorted list; position i is cell (i // n, i % n).
        # Find the first position whose value is >= target. It always stays in [lo, hi].
        lo, hi = 0, total
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if matrix[mid // n][mid % n] >= target:   # divide by COLUMNS, not rows
                hi = mid          # mid might be the answer, so keep it
            else:
                lo = mid + 1      # mid and everything before it are too small

        # lo == total means every value is smaller than target
        return lo < total and matrix[lo // n][lo % n] == target
