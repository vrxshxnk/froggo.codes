class Solution:
    def getSum(self, a: int, b: int) -> int:
        # Python ints never overflow, so a negative carry would grow forever.
        # Keep everything inside 32 bits, like a real CPU register.
        MASK = 0xFFFFFFFF
        a &= MASK
        b &= MASK
        while b != 0:
            carry = ((a & b) << 1) & MASK  # columns where both are 1 carry left
            a = a ^ b                      # add each column, ignoring carries
            b = carry                      # now add the carries the same way

        # a holds a 32-bit pattern; if bit 31 is set it is a negative number
        return a if a <= 0x7FFFFFFF else a - (1 << 32)
