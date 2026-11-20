class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> result;
        int i = 0, n = intervals.size();
        int start = newInterval[0], end = newInterval[1];

        // 1. intervals that finish before the new one starts: copy them unchanged
        while (i < n && intervals[i][1] < start) {
            result.push_back(intervals[i]);
            i++;
        }

        // 2. intervals that start before the new one ends overlap it: absorb them
        while (i < n && intervals[i][0] <= end) {
            start = min(start, intervals[i][0]);
            end = max(end, intervals[i][1]);
            i++;
        }
        result.push_back({start, end});

        // 3. everything left starts after the merged block ends: copy unchanged
        while (i < n) {
            result.push_back(intervals[i]);
            i++;
        }

        return result;
    }
};
