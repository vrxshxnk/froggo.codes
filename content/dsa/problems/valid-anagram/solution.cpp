class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;

        int count[26] = {0};                 // one slot per letter a..z
        for (size_t i = 0; i < s.size(); i++) {
            count[s[i] - 'a']++;             // letter from s
            count[t[i] - 'a']--;             // letter from t
        }

        for (int c : count) {
            if (c != 0) return false;        // some letter didn't cancel out
        }
        return true;
    }
};
