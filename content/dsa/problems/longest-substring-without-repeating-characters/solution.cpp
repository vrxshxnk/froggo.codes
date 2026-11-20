class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> window;  // the characters inside s[left..right]; all distinct
        int left = 0;
        int best = 0;

        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            // Adding c would create a repeat: shrink from the left until
            // the old copy of c has left the window
            while (window.count(c)) {
                window.erase(s[left]);
                left++;
            }

            window.insert(c);
            best = max(best, right - left + 1);  // the window is valid again
        }

        return best;
    }
};
