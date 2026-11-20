/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // down, up, right, left
  let islands = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1") continue;
      // Unvisited land: a new island. Flood all of it so we never count it again.
      islands++;
      grid[r][c] = "0"; // mark when we ADD to the queue, not when we pop
      const queue = [[r, c]];
      // An array with a moving head is an O(1) queue; shift() would be O(n)
      for (let head = 0; head < queue.length; head++) {
        const [cr, cc] = queue[head];
        for (const [dr, dc] of directions) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
            grid[nr][nc] = "0";
            queue.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
};
