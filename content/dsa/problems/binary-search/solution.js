/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function (nums, target) {
  // Find the first index with nums[i] >= target (the lower bound).
  // Invariant: that index is always inside [lo, hi]; hi = n means "past the end".
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] >= target) {
      hi = mid;        // mid might be the answer, so keep it
    } else {
      lo = mid + 1;    // mid and everything left of it are too small
    }
  }

  // lo is where target would sit; it's only a match if it's really there
  if (lo < nums.length && nums[lo] === target) return lo;
  return -1;
};
