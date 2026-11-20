import bisect


class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        # tails[k] = the smallest value that can end an increasing subsequence of length k + 1
        # (tails is always strictly increasing, so we can binary search it)
        tails = []

        for x in nums:
            # k = first slot whose tail is >= x; x can extend every length before slot k,
            # so the longest increasing subsequence ending at x has length k + 1 (that's dp[i])
            k = bisect.bisect_left(tails, x)
            if k == len(tails):
                tails.append(x)  # x beats every tail: a new, longer length
            else:
                tails[k] = x     # same length, smaller ending: easier to extend later

        return len(tails)
