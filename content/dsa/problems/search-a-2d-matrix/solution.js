/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function (matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  const total = m * n;

  // Read row by row, the grid is one sorted list; position i is cell (i / n, i % n).
  // Find the first position whose value is >= target. It always stays in [lo, hi].
  let lo = 0, hi = total;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (matrix[Math.floor(mid / n)][mid % n] >= target) {  // divide by COLUMNS, not rows
      hi = mid;      // mid might be the answer, so keep it
    } else {
      lo = mid + 1;  // mid and everything before it are too small
    }
  }

  // lo === total means every value is smaller than target
  return lo < total && matrix[Math.floor(lo / n)][lo % n] === target;
};
