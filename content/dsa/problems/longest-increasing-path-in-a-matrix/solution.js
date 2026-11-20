/**
 * @param {number[][]} matrix
 * @return {number}
 */
var longestIncreasingPath = function (matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // memo[r][c] = longest increasing path STARTING at (r, c); 0 = not computed.
  // Strictly increasing paths can never loop back, so this never changes once known.
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0));

  const dfs = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let best = 1; // the cell on its own
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c])
        best = Math.max(best, 1 + dfs(nr, nc));
    }
    memo[r][c] = best;
    return best;
  };

  let best = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) best = Math.max(best, dfs(r, c));
  return best;
};
