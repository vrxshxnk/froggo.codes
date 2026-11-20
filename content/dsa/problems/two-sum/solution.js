/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  const seen = new Map(); // value -> index of every number we've passed

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {      // partner already seen?
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);      // store AFTER checking
  }

  return []; // guaranteed answer, never reached
};
