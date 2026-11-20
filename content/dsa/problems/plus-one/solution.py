class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        # Add 1 the way you do on paper: start at the last digit
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1   # this digit absorbs the carry...
                return digits    # ...so nothing to its left changes
            digits[i] = 0        # 9 + 1 = 10: write 0, carry 1 to the left

        # Fell off the front: every digit was 9, e.g. 999 + 1 = 1000
        return [1] + digits
