class Solution {
    public int[] plusOne(int[] digits) {
        // Add 1 the way you do on paper: start at the last digit
        for (int i = digits.length - 1; i >= 0; i--) {
            if (digits[i] < 9) {
                digits[i]++;     // this digit absorbs the carry...
                return digits;   // ...so nothing to its left changes
            }
            digits[i] = 0;       // 9 + 1 = 10: write 0, carry 1 to the left
        }

        // Fell off the front: every digit was 9, e.g. 999 + 1 = 1000.
        // A new Java int array starts as all zeros, so only the leading 1 needs setting.
        int[] result = new int[digits.length + 1];
        result[0] = 1;
        return result;
    }
}
