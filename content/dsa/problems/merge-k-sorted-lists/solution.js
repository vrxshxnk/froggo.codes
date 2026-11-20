// JavaScript has no built-in heap, so here is a small binary min-heap.
// less(a, b) says whether a should come out before b.
class MinHeap {
  constructor(less) {
    this.less = less;
    this.items = [];
  }
  size() {
    return this.items.length;
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
      while (true) { // sift down: swap with the smaller child while it beats us
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

/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function (lists) {
  // The heap holds the current head of every list: at most k nodes at a time.
  const heap = new MinHeap((a, b) => a.val < b.val);
  for (const node of lists) if (node) heap.push(node);

  const dummy = new ListNode(); // dummy head: no special case for the first node
  let tail = dummy;
  while (heap.size() > 0) {
    const node = heap.pop(); // smallest head across all lists
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next); // that list's next node is now its head
  }
  return dummy.next;
};
