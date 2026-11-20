class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False

        count = [0] * 26                    # one slot per letter a..z
        for a, b in zip(s, t):
            count[ord(a) - ord('a')] += 1   # letter from s
            count[ord(b) - ord('a')] -= 1   # letter from t

        return all(c == 0 for c in count)   # anagrams cancel out exactly
