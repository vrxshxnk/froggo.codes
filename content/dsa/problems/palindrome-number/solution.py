class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:                # "-121" backwards is "121-": never a palindrome
            return False

        original = x
        rev = 0                  # the digits of x, read right to left
        while x > 0:
            digit = x % 10       # last digit
            rev = rev * 10 + digit   # shift left, append the digit
            x //= 10             # chop the last digit off

        return rev == original
