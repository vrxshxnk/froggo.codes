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
 * @param {number[][]} edges
 * @return {number[]}
 */
var findRedundantConnection = function (edges) {
  const dsu = new DSU(edges.length + 1); // nodes are labelled 1..n, and n == edges.length

  for (const [a, b] of edges) {
    if (!dsu.union(a, b)) {
      // already connected: this edge closes the cycle, and it's the
      // last cycle edge in input order
      return [a, b];
    }
  }

  return []; // exactly one extra edge is guaranteed, never reached
};
