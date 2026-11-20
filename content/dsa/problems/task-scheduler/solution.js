/**
 * @param {character[]} tasks
 * @param {number} n
 * @return {number}
 */
var leastInterval = function (tasks, n) {
  const count = new Array(26).fill(0);
  for (const t of tasks) count[t.charCodeAt(0) - 65]++;

  const maxCount = Math.max(...count);                    // the busiest task sets the skeleton
  const numMax = count.filter((c) => c === maxCount).length; // tasks tied for busiest share the last row

  // (maxCount - 1) full rows of width n + 1, then one last row holding the tied tasks.
  const frame = (maxCount - 1) * (n + 1) + numMax;
  // If there are more tasks than slots, no idling is ever needed.
  return Math.max(frame, tasks.length);
};
