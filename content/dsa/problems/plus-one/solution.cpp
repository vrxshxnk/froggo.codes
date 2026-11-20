class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        // Add 1 the way you do on paper: start at the last digit
        for (int i = (int)digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) {
                digits[i]++;     // this digit absorbs the carry...
                return digits;   // ...so nothing to its left changes
            }
            digits[i] = 0;       // 9 + 1 = 10: write 0, carry 1 to the left
        }

        // Fell off the front: every digit was 9, e.g. 999 + 1 = 1000
        digits.insert(digits.begin(), 1);
        return digits;
    }
};
