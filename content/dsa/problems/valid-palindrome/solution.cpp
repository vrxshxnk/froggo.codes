class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = (int)s.size() - 1;

        while (left < right) {
            // Skip anything that isn't a letter or digit: it doesn't count
            while (left < right && !isalnum((unsigned char)s[left])) left++;
            while (left < right && !isalnum((unsigned char)s[right])) right--;

            // Compare case-insensitively: 'A' and 'a' are the same letter
            if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
                return false;
            }

            // This pair matched, so both ends move inwards
            left++;
            right--;
        }

        return true;  // the pointers met without a mismatch
    }
};
