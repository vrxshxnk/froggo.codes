/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var subarraySum = function (nums, k) {
  const count = new Map([[0, 1]]); // prefix sum -> times seen; empty prefix once
  let prefix = 0;
  let answer = 0;

  for (const x of nums) {
    prefix += x;
    answer += count.get(prefix - k) || 0;
    count.set(prefix, (count.get(prefix) || 0) + 1); // record AFTER looking up
  }

  return answer;
};
