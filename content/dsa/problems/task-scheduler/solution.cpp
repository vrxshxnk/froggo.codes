class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int count[26] = {0};
        for (char t : tasks) count[t - 'A']++;

        int maxCount = *max_element(count, count + 26);  // the busiest task sets the skeleton
        int numMax = 0;                                   // tasks tied for busiest share the last row
        for (int c : count) {
            if (c == maxCount) numMax++;
        }

        // (maxCount - 1) full rows of width n + 1, then one last row holding the tied tasks.
        int frame = (maxCount - 1) * (n + 1) + numMax;
        // If there are more tasks than slots, no idling is ever needed.
        return max(frame, (int)tasks.size());
    }
};
