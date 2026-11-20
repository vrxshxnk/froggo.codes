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
 * @param {number} n
 * @param {number[][]} connections
 * @return {number}
 */
var makeConnected = function (n, connections) {
  // n computers need at least n - 1 cables to be connected at all
  if (connections.length < n - 1) return -1;

  const dsu = new DSU(n);
  let components = n;
  for (const [a, b] of connections) {
    if (dsu.union(a, b)) components--;
  }

  // we have enough spare cables, so joining k islands costs k - 1 moves
  return components - 1;
};
