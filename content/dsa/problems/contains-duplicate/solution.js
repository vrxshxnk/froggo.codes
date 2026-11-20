/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function (nums) {
  const seen = new Set();

  for (const x of nums) {
    if (seen.has(x)) return true; // already met this value -> duplicate
    seen.add(x);
  }

  return false; // every value was unique
};
