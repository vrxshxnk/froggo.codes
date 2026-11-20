class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for bit in range(32):
            # Every number that appears three times adds 0 or 3 to this column,
            # so whatever is left after % 3 is the single number's bit
            count = 0
            for x in nums:
                count += (x >> bit) & 1
            if count % 3:
                result |= 1 << bit

        # Python ints have no 32-bit limit, so bit 31 reads as +2^31.
        # In two's complement it means -2^31: shift the value down by 2^32.
        if result >= 1 << 31:
            result -= 1 << 32
        return result
