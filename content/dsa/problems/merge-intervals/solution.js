/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function (intervals) {
  // after sorting by start, anything that overlaps the current block is right next to it
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];

  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      // overlaps (or touches) the last block: stretch it, but never shrink it
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]); // a gap: start a new block
    }
  }

  return merged;
};
