/**
 * @param {number[][]} grid
 * @return {number}
 */
var maxAreaOfIsland = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // down, up, right, left
  let best = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;
      // New island: count its cells with an iterative DFS (an explicit stack, no recursion)
      let area = 0;
      grid[r][c] = 0; // mark when pushed, so no cell is counted twice
      const stack = [[r, c]];
      while (stack.length > 0) {
        const [cr, cc] = stack.pop();
        area++;
        for (const [dr, dc] of directions) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
            grid[nr][nc] = 0;
            stack.push([nr, nc]);
          }
        }
      }
      best = Math.max(best, area);
    }
  }
  return best;
};
