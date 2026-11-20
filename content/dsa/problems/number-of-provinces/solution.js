class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); // every city starts as its own root
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
 * @param {number[][]} isConnected
 * @return {number}
 */
var findCircleNum = function (isConnected) {
  const n = isConnected.length;
  const dsu = new DSU(n);
  let provinces = n; // start with n separate cities

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) { // symmetric matrix: upper half is enough
      if (isConnected[i][j] === 1 && dsu.union(i, j)) {
        provinces--;                  // each successful merge joins two groups
      }
    }
  }

  return provinces;
};
