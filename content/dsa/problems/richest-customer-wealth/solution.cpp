class Solution {
public:
    int maximumWealth(vector<vector<int>>& accounts) {
        int best = 0;  // safe start: every amount is at least 1, so any real total beats it

        for (const vector<int>& row : accounts) {
            int wealth = 0;      // reset for EVERY customer, or totals leak across rows
            for (int money : row) {
                wealth += money;
            }
            if (wealth > best) {
                best = wealth;
            }
        }

        return best;
    }
};
