class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = [0] * 26  # letter counts inside s[left..right]
        left = 0
        max_freq = 0      # highest count any letter has reached in a window
        best = 0

        for right, c in enumerate(s):
            count[ord(c) - ord('A')] += 1
            max_freq = max(max_freq, count[ord(c) - ord('A')])

            # Letters to repaint = window length - most common letter.
            # More than k? Shrink. max_freq is never lowered: a stale value only
            # keeps the window at its best size so far, which can't beat best.
            while (right - left + 1) - max_freq > k:
                count[ord(s[left]) - ord('A')] -= 1
                left += 1

            best = max(best, right - left + 1)

        return best
