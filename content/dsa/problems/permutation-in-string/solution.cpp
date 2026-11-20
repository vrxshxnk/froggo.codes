class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int m = s1.size();
        int need[26] = {0};  // need[c] = copies of c in s1 minus copies in the window
        for (char c : s1) need[c - 'a']++;
        int missing = m;     // letters of s1 the window still lacks

        for (int right = 0; right < (int)s2.size(); right++) {
            // The window grows by s2[right]
            int c = s2[right] - 'a';
            if (need[c] > 0) missing--;  // it filled a gap; an extra copy fills nothing
            need[c]--;

            // Keep the window exactly m long: drop the letter that falls out
            if (right >= m) {
                int out = s2[right - m] - 'a';
                need[out]++;
                if (need[out] > 0) missing++;  // we just lost a letter s1 needed
            }

            // m letters with nothing missing means the same letters as s1
            if (missing == 0) return true;
        }

        return false;
    }
};
