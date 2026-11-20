/**
 * @param {character[][]} board
 * @return {boolean}
 */
var isValidSudoku = function (board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const d = board[r][c];
      if (d === ".") continue; // empty cells never clash

      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3); // which 3x3 box
      if (rows[r].has(d) || cols[c].has(d) || boxes[b].has(d)) return false;

      rows[r].add(d);
      cols[c].add(d);
      boxes[b].add(d);
    }
  }
  return true;
};
