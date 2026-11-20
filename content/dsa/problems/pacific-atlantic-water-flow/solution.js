/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
var pacificAtlantic = function (heights) {
  const rows = heights.length, cols = heights[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // down, up, right, left

  // Multi-source BFS from an ocean's shore, walking UPHILL (water flowing backwards).
  const reachable = (starts) => {
    const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const queue = [];
    for (const [r, c] of starts) {
      if (!seen[r][c]) {
        seen[r][c] = true;
        queue.push([r, c]);
      }
    }
    // An array with a moving head is an O(1) queue; shift() would be O(n)
    for (let head = 0; head < queue.length; head++) {
      const [r, c] = queue[head];
      for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc] &&
            heights[nr][nc] >= heights[r][c]) { // water could flow nr,nc -> r,c
          seen[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return seen;
  };

  const pacificShore = [], atlanticShore = [];
  for (let c = 0; c < cols; c++) {
    pacificShore.push([0, c]);
    atlanticShore.push([rows - 1, c]);
  }
  for (let r = 0; r < rows; r++) {
    pacificShore.push([r, 0]);
    atlanticShore.push([r, cols - 1]);
  }
  const pacific = reachable(pacificShore);
  const atlantic = reachable(atlanticShore);

  const result = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);
  return result;
};
