/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function (nums) {
  let best = nums[0];
  let cur = nums[0]; // best sum of a subarray that ENDS at the current index

  for (let i = 1; i < nums.length; i++) {
    // A negative running sum only drags nums[i] down, so drop it and start fresh.
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }

  return best;
};
