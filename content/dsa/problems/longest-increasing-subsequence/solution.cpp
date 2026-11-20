class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        // tails[k] = the smallest value that can end an increasing subsequence of length k + 1
        // (tails is always strictly increasing, so we can binary search it)
        vector<int> tails;

        for (int x : nums) {
            // k = first slot whose tail is >= x; x can extend every length before slot k,
            // so the longest increasing subsequence ending at x has length k + 1 (that's dp[i])
            int k = lower_bound(tails.begin(), tails.end(), x) - tails.begin();
            if (k == (int)tails.size()) {
                tails.push_back(x);  // x beats every tail: a new, longer length
            } else {
                tails[k] = x;        // same length, smaller ending: easier to extend later
            }
        }

        return tails.size();
    }
};
