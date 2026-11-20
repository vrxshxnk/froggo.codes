/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  const s = new Set(nums);
  let best = 0;

  for (const x of s) {              // iterate the SET, not the array
    if (s.has(x - 1)) continue;     // not the start of a run

    let length = 1;
    while (s.has(x + length)) length++; // count upward from the start
    best = Math.max(best, length);
  }

  return best;
};
