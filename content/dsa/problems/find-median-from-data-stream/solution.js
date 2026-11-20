// JavaScript has no built-in heap, so here is a small binary heap.
// less(a, b) says whether a should come out before b.
class MinHeap {
  constructor(less) {
    this.less = less;
    this.items = [];
  }
  size() {
    return this.items.length;
  }
  peek() {
    return this.items[0];
  }
  push(x) {
    const a = this.items;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) { // sift up: swap with the parent while we beat it
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) { // sift down: swap with the better child while it beats us
        const l = 2 * i + 1, r = l + 1;
        let best = i;
        if (l < a.length && this.less(a[l], a[best])) best = l;
        if (r < a.length && this.less(a[r], a[best])) best = r;
        if (best === i) break;
        [a[i], a[best]] = [a[best], a[i]];
        i = best;
      }
    }
    return top;
  }
}

class MedianFinder {
  constructor() {
    // low = smaller half; reversing the comparison makes it a max-heap.
    // high = larger half, a normal min-heap.
    // Invariant: low.size() === high.size() or low.size() === high.size() + 1.
    this.low = new MinHeap((a, b) => a > b);
    this.high = new MinHeap((a, b) => a < b);
  }

  /**
   * @param {number} num
   * @return {void}
   */
  addNum(num) {
    // Push through low first, so the largest of the small half moves up to
    // high. That keeps every element of low <= every element of high.
    this.low.push(num);
    this.high.push(this.low.pop());
    // Rebalance: low may be bigger by one, never smaller.
    if (this.high.size() > this.low.size()) this.low.push(this.high.pop());
  }

  /**
   * @return {number}
   */
  findMedian() {
    if (this.low.size() > this.high.size()) return this.low.peek(); // odd count: low's top
    return (this.low.peek() + this.high.peek()) / 2;
  }
}
