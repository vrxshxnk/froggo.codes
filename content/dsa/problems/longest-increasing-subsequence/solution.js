/**
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function (nums) {
  // tails[k] = the smallest value that can end an increasing subsequence of length k + 1
  // (tails is always strictly increasing, so we can binary search it)
  const tails = [];

  for (const x of nums) {
    // k = first slot whose tail is >= x; x can extend every length before slot k,
    // so the longest increasing subsequence ending at x has length k + 1 (that's dp[i])
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    const k = lo;
    if (k === tails.length) {
      tails.push(x); // x beats every tail: a new, longer length
    } else {
      tails[k] = x;  // same length, smaller ending: easier to extend later
    }
  }

  return tails.length;
};
