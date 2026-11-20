class Solution {
public:
    int getSum(int a, int b) {
        // Unsigned arithmetic: shifting a 1 into bit 31 is well defined
        uint32_t x = a, y = b;
        while (y != 0) {
            uint32_t carry = (x & y) << 1;  // columns where both are 1 carry left
            x = x ^ y;                      // add each column, ignoring carries
            y = carry;                      // now add the carries the same way
        }
        return (int)x;  // the 32 bits are the two's complement answer
    }
};
