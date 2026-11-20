class Solution {
public:
    string minWindow(string s, string t) {
        int need[128] = {0};  // need[c] = copies of c the window still owes us (negative = spare)
        for (char c : t) need[c]++;
        int missing = t.size();  // characters of t not yet covered by the window

        int bestStart = 0, bestLen = INT_MAX;
        int left = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            // Grow: take s[right]. It only helps if the window still owed us one.
            if (need[s[right]] > 0) missing--;
            need[s[right]]--;

            // Shrink: while the window is valid, record it and drop the left char.
            while (missing == 0) {
                if (right - left + 1 < bestLen) {
                    bestStart = left;
                    bestLen = right - left + 1;
                }
                need[s[left]]++;
                if (need[s[left]] > 0) missing++;  // we just gave away a char we needed
                left++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);
    }
};
