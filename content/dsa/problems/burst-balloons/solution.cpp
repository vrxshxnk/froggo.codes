class Solution {
public:
    int maxCoins(vector<int>& nums) {
        // Pad with the imaginary 1s at both ends, so every balloon has two neighbours.
        vector<int> vals = {1};
        vals.insert(vals.end(), nums.begin(), nums.end());
        vals.push_back(1);
        int n = vals.size();
        // dp[l][r] = best coins from bursting every balloon strictly between l and r,
        // while l and r themselves are still standing.
        vector<vector<int>> dp(n, vector<int>(n, 0));

        for (int length = 2; length < n; length++) {  // distance r - l; short gaps first
            for (int l = 0; l + length < n; l++) {
                int r = l + length;
                int best = 0;
                for (int k = l + 1; k < r; k++) {  // k = the LAST balloon burst in (l, r)
                    // When k goes last, its neighbours are exactly l and r.
                    best = max(best, dp[l][k] + vals[l] * vals[k] * vals[r] + dp[k][r]);
                }
                dp[l][r] = best;
            }
        }
        return dp[0][n - 1];
    }
};
