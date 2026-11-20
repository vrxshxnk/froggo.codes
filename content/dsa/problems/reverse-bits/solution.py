class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0
        for _ in range(32):
            # Make room on the right of result, then drop in n's lowest bit.
            # The bit n gives up first ends up furthest left after 32 shifts.
            result = (result << 1) | (n & 1)
            n >>= 1
        return result
