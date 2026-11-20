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

/**
 * @param {number[][]} intervals
 * @return {number}
 */
var minMeetingRooms = function (intervals) {
  intervals.sort((a, b) => a[0] - b[0]); // handle meetings in the order they start
  const ends = new MinHeap();            // end time of the meeting in each room in use

  for (const [start, end] of intervals) {
    // The room that frees up first is on top. If it is free by now, reuse it.
    // "<=" because a meeting ending at 10 frees its room for one starting at 10.
    if (ends.size() && ends.peek() <= start) {
      ends.pop();
    }
    ends.push(end);
  }

  return ends.size(); // never shrinks, so its final size is the most rooms ever in use
};
