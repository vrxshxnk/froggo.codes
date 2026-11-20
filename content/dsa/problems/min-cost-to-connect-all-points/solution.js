/**
 * @param {number[][]} points
 * @return {number}
 */
var minCostConnectPoints = function (points) {
  const n = points.length;
  const best = new Array(n).fill(Infinity); // best[v] = cheapest edge from the tree to point v so far
  const inTree = new Array(n).fill(false);
  best[0] = 0;                              // start the tree at point 0 for free
  let total = 0;

  for (let step = 0; step < n; step++) {
    // Prim: grab the point outside the tree with the cheapest connection
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (u === -1 || best[i] < best[u])) u = i;
    }
    inTree[u] = true;
    total += best[u];

    // u just joined, so it may offer a cheaper edge to the points still outside
    for (let v = 0; v < n; v++) {
      if (!inTree[v]) {
        const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
        if (d < best[v]) best[v] = d;
      }
    }
  }

  return total;
};
