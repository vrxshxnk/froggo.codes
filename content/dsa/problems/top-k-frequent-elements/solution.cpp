class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;            // value -> how many times
        for (int x : nums) count[x]++;

        int n = nums.size();
        vector<vector<int>> buckets(n + 1);       // buckets[c] = values seen c times
        for (auto& [value, c] : count) {
            buckets[c].push_back(value);
        }

        vector<int> result;
        for (int c = n; c >= 1; c--) {            // most frequent first
            for (int value : buckets[c]) {
                result.push_back(value);
                if ((int)result.size() == k) return result;
            }
        }
        return result;
    }
};
