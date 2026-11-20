class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); // every node starts as its own root
    this.size = new Array(n).fill(1);
  }

  find(x) {
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    // path compression: point every node we walked past straight at the root
    while (x !== root) {
      const nxt = this.parent[x];
      this.parent[x] = root;
      x = nxt;
    }
    return root;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;                          // already in the same group
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra]; // union by size
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}

/**
 * @param {number[][]} grid
 * @return {number}
 */
var swimInWater = function (grid) {
  const n = grid.length;
  // heights are a permutation of 0..n*n-1, so we can find "the cell of height t" directly
  const cellAt = new Array(n * n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) cellAt[grid[r][c]] = r * n + c;

  const dsu = new DSU(n * n); // cell (r, c) is node r * n + c
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let t = 0; t < n * n; t++) {
    // at time t exactly one new cell goes underwater: join it to flooded neighbours
    const r = Math.floor(cellAt[t] / n), c = cellAt[t] % n;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] <= t) {
        dsu.union(r * n + c, nr * n + nc);
      }
    }
    if (dsu.find(0) === dsu.find(n * n - 1)) return t; // first moment they meet
  }

  return n * n - 1; // unreachable: by the last time every cell is flooded
};
