/**
 * @param {number[][]} grid
 * @return {number}
 */
var orangesRotting = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // down, up, right, left

  // Multi-source BFS: every rotten orange starts in the queue at minute 0
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }

  let minutes = 0;
  while (queue.length > 0 && fresh > 0) {
    // Everything in the queue right now rotted at the same minute: process that whole level
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // rot it now, so it is queued only once
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }

  return fresh === 0 ? minutes : -1;
};
