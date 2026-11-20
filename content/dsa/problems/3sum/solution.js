/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  nums.sort((a, b) => a - b); // numeric sort: the default sort compares as strings
  const n = nums.length;
  const result = [];

  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break;                        // smallest is positive: no sum can be 0
    if (i > 0 && nums[i] === nums[i - 1]) continue; // same first number: same triplets again

    // Two Sum II on the part to the right of i, looking for -nums[i]
    let left = i + 1, right = n - 1;
    while (left < right) {
      const total = nums[i] + nums[left] + nums[right];
      if (total < 0) {
        left++;
      } else if (total > 0) {
        right--;
      } else {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        // skip copies of the middle number so this triplet isn't added twice
        while (left < right && nums[left] === nums[left - 1]) left++;
      }
    }
  }

  return result;
};
