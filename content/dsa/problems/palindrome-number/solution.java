class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) {             // "-121" backwards is "121-": never a palindrome
            return false;
        }

        int original = x;
        long rev = 0;            // 64 bits: reversing 2147483647 gives 7463847412
        while (x > 0) {
            int digit = x % 10;      // last digit
            rev = rev * 10 + digit;  // shift left, append the digit
            x /= 10;                 // chop the last digit off
        }

        return rev == original;
    }
}
