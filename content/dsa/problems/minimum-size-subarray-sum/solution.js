/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
  const n = nums.length;
  let left = 0;
  let windowSum = 0; // sum of nums[left..right]
  let best = n + 1;  // "no answer yet": longer than any real window

  for (let right = 0; right < n; right++) {
    windowSum += nums[right];

    // While the window is big enough, record it, then try a shorter one.
    // All numbers are positive, so dropping one always lowers the sum.
    while (windowSum >= target) {
      best = Math.min(best, right - left + 1);
      windowSum -= nums[left];
      left++;
    }
  }

  return best === n + 1 ? 0 : best;
};
