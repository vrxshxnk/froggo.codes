class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> ans(n + 1, 0);
        for (int i = 1; i <= n; i++) {
            // i >> 1 is i with its last bit chopped off, and it is smaller than i,
            // so its count is already known; add back the bit we chopped (i & 1)
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;
    }
};
