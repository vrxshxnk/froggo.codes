/**
 * @param {number[][]} intervals
 * @param {number[]} newInterval
 * @return {number[][]}
 */
var insert = function (intervals, newInterval) {
  const result = [];
  const n = intervals.length;
  let i = 0;
  let [start, end] = newInterval;

  // 1. intervals that finish before the new one starts: copy them unchanged
  while (i < n && intervals[i][1] < start) {
    result.push(intervals[i]);
    i++;
  }

  // 2. intervals that start before the new one ends overlap it: absorb them
  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);

  // 3. everything left starts after the merged block ends: copy unchanged
  while (i < n) {
    result.push(intervals[i]);
    i++;
  }

  return result;
};
