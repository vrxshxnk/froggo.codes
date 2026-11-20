class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        m = len(s1)
        need = [0] * 26  # need[c] = copies of c in s1 minus copies in the window
        for c in s1:
            need[ord(c) - ord('a')] += 1
        missing = m      # letters of s1 the window still lacks

        for right in range(len(s2)):
            # The window grows by s2[right]
            c = ord(s2[right]) - ord('a')
            if need[c] > 0:
                missing -= 1  # it filled a gap; an extra copy fills nothing
            need[c] -= 1

            # Keep the window exactly m long: drop the letter that falls out
            if right >= m:
                out = ord(s2[right - m]) - ord('a')
                need[out] += 1
                if need[out] > 0:
                    missing += 1  # we just lost a letter s1 needed

            # m letters with nothing missing means the same letters as s1
            if missing == 0:
                return True

        return False
