/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function (nums) {
  let result = 0;
  for (const x of nums) {
    // x ^ x = 0 and x ^ 0 = x, so every pair cancels and only the loner survives
    result ^= x;
  }
  return result;
};
