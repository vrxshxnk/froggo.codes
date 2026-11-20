class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()  # the characters inside s[left..right]; all distinct
        left = 0
        best = 0

        for right, c in enumerate(s):
            # Adding c would create a repeat: shrink from the left until
            # the old copy of c has left the window
            while c in window:
                window.remove(s[left])
                left += 1

            window.add(c)
            best = max(best, right - left + 1)  # the window is valid again

        return best
