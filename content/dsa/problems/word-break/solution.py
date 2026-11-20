class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        n = len(s)
        # dp[i] = True when the first i characters, s[0:i], can be split into dictionary words
        dp = [False] * (n + 1)
        dp[0] = True  # the empty prefix needs no words

        for i in range(1, n + 1):
            for w in wordDict:
                L = len(w)
                # w can be the LAST word of s[0:i] if it fits, the part before it splits,
                # and s really ends with w at position i
                if L <= i and dp[i - L] and s.startswith(w, i - L):
                    dp[i] = True
                    break  # one way is enough

        return dp[n]
