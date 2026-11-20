class Solution {
public:
    int characterReplacement(string s, int k) {
        int count[26] = {0};  // letter counts inside s[left..right]
        int left = 0;
        int maxFreq = 0;      // highest count any letter has reached in a window
        int best = 0;

        for (int right = 0; right < (int)s.size(); right++) {
            count[s[right] - 'A']++;
            maxFreq = max(maxFreq, count[s[right] - 'A']);

            // Letters to repaint = window length - most common letter.
            // More than k? Shrink. maxFreq is never lowered: a stale value only
            // keeps the window at its best size so far, which can't beat best.
            while ((right - left + 1) - maxFreq > k) {
                count[s[left] - 'A']--;
                left++;
            }

            best = max(best, right - left + 1);
        }

        return best;
    }
};
