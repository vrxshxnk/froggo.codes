// JavaScript has no built-in heap, so we carry a small binary min-heap.
class MinHeap {
  constructor() {
    this.a = [];
  }
  size() {
    return this.a.length;
  }
  peek() {
    return this.a[0];
  }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {                       // bubble up while smaller than the parent
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;                        // move the last leaf to the root, then sink it
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

class KthLargest {
  /**
   * @param {number} k
   * @param {number[]} nums
   */
  constructor(k, nums) {
    this.k = k;
    this.heap = new MinHeap(); // the k largest numbers seen so far
    for (const x of nums) this.add(x);
  }

  /**
   * @param {number} val
   * @return {number}
   */
  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) {
      this.heap.pop();         // drop the smallest: it can never be the k-th largest again
    }
    return this.heap.peek();   // smallest of the top k = the k-th largest
  }
}
