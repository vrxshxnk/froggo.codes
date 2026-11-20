class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            # n - 1 flips the lowest 1 to 0 and the 0s below it to 1s,
            # so n & (n - 1) is n with exactly its lowest set bit removed
            n &= n - 1
            count += 1
        return count
