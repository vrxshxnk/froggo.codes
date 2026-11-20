class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = [0] * 128  # need[c] = copies of c the window still owes us (negative = spare)
        for c in t:
            need[ord(c)] += 1
        missing = len(t)  # characters of t not yet covered by the window

        best_start, best_len = 0, float("inf")
        left = 0
        for right, c in enumerate(s):
            # Grow: take s[right]. It only helps if the window still owed us one.
            if need[ord(c)] > 0:
                missing -= 1
            need[ord(c)] -= 1

            # Shrink: while the window is valid, record it and drop the left char.
            while missing == 0:
                if right - left + 1 < best_len:
                    best_start, best_len = left, right - left + 1
                out = ord(s[left])
                need[out] += 1
                if need[out] > 0:  # we just gave away a char we needed
                    missing += 1
                left += 1

        return "" if best_len == float("inf") else s[best_start:best_start + best_len]
