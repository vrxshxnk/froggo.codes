/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function (nums, target) {
  const n = nums.length;

  // Lower bound: first index with nums[i] >= target, i.e. the first copy.
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] >= target) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  const first = lo;

  // Landing past the end, or on a bigger number, means target is missing
  if (first === n || nums[first] !== target) return [-1, -1];

  // Upper bound: first index with nums[i] > target, i.e. one PAST the last copy.
  lo = 0;
  hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] > target) {  // the only change: > instead of >=
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  const upper = lo;

  return [first, upper - 1];
};
