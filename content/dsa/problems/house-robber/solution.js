/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
  const n = nums.length;
  // dp[i] = the most money you can take from the first i houses (nums[0..i-1])
  const dp = new Array(n + 1).fill(0);
  dp[1] = nums[0]; // one house: take it

  for (let i = 2; i <= n; i++) {
    const skip = dp[i - 1];               // leave house i-1 alone
    const take = dp[i - 2] + nums[i - 1]; // rob it, so its left neighbour must be skipped
    dp[i] = Math.max(skip, take);
  }

  return dp[n];
};
