class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1

        while left < right:
            # Skip anything that isn't a letter or digit: it doesn't count
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1

            # Compare case-insensitively: 'A' and 'a' are the same letter
            if s[left].lower() != s[right].lower():
                return False

            # This pair matched, so both ends move inwards
            left += 1
            right -= 1

        return True  # the pointers met without a mismatch
