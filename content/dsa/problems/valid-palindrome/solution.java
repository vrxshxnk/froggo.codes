class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;

        while (left < right) {
            // Skip anything that isn't a letter or digit: it doesn't count
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;

            // Compare case-insensitively: 'A' and 'a' are the same letter
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }

            // This pair matched, so both ends move inwards
            left++;
            right--;
        }

        return true; // the pointers met without a mismatch
    }
}
