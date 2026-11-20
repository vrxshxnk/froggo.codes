class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;

        for (int x : s) {                       // iterate the SET, not the array
            if (s.count(x - 1)) continue;       // not the start of a run

            int length = 1;
            while (s.count(x + length)) length++;  // count upward from the start
            best = max(best, length);
        }

        return best;
    }
};
