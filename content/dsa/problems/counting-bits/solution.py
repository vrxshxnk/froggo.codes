class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            # i >> 1 is i with its last bit chopped off, and it is smaller than i,
            # so its count is already known; add back the bit we chopped (i & 1)
            ans[i] = ans[i >> 1] + (i & 1)
        return ans
