class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        // handle meetings in the order they start
        sort(intervals.begin(), intervals.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
        // min-heap (greater<int>): end time of the meeting in each room in use
        priority_queue<int, vector<int>, greater<int>> ends;

        for (const auto& m : intervals) {
            // The room that frees up first is on top. If it is free by now, reuse it.
            // "<=" because a meeting ending at 10 frees its room for one starting at 10.
            if (!ends.empty() && ends.top() <= m[0]) {
                ends.pop();
            }
            ends.push(m[1]);
        }

        return ends.size();  // never shrinks, so its final size is the most rooms ever in use
    }
};
