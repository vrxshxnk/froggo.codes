// JavaScript has no built-in heap, so here is a small binary min-heap of [key, value] pairs.
class MinHeap {
  constructor() {
    this.a = [];
  }
  get size() {
    return this.a.length;
  }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) { // sift up while the parent is bigger
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      while (true) { // sift down towards the smaller child
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

/**
 * @param {number[][]} times
 * @param {number} n
 * @param {number} k
 * @return {number}
 */
var networkDelayTime = function (times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []); // graph[u] = [v, w], nodes are 1..n
  for (const [u, v, w] of times) graph[u].push([v, w]);

  const dist = new Array(n + 1).fill(-1); // -1 = not settled yet
  const heap = new MinHeap();             // entries are [time to reach node, node]
  heap.push([0, k]);
  let settled = 0, answer = 0;

  while (heap.size) {
    const [d, u] = heap.pop();
    if (dist[u] !== -1) continue; // stale entry: u already settled with a smaller time
    dist[u] = d;                  // smallest time in the heap is final (weights >= 0)
    settled++;
    answer = Math.max(answer, d);
    for (const [v, w] of graph[u]) {
      if (dist[v] === -1) heap.push([d + w, v]);
    }
  }

  // every node must hear the signal; the last one to hear it sets the answer
  return settled === n ? answer : -1;
};
