/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function (board, word) {
  const rows = board.length, cols = board[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // down, up, right, left

  // Can word[k..] be spelled starting at cell (r, c)?
  const dfs = (r, c, k) => {
    if (board[r][c] !== word[k]) return false;
    if (k === word.length - 1) return true; // matched the last letter

    const saved = board[r][c];
    board[r][c] = "#"; // choose: mark visited so this path can't reuse the cell
    let found = false;
    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && dfs(nr, nc, k + 1)) {
        found = true;
        break;
      }
    }
    board[r][c] = saved; // un-choose: other paths may still use this cell
    return found;
  };

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (dfs(r, c, 0)) return true;
  return false;
};
