class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // after sorting by start, anything that overlaps the current block is right next to it
        sort(intervals.begin(), intervals.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
        vector<vector<int>> merged;

        for (const vector<int>& iv : intervals) {
            if (!merged.empty() && iv[0] <= merged.back()[1]) {
                // overlaps (or touches) the last block: stretch it, but never shrink it
                merged.back()[1] = max(merged.back()[1], iv[1]);
            } else {
                merged.push_back({iv[0], iv[1]});  // a gap: start a new block
            }
        }

        return merged;
    }
};
