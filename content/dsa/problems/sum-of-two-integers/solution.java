class Solution {
    public int getSum(int a, int b) {
        while (b != 0) {
            int carry = (a & b) << 1;  // columns where both are 1 carry left
            a = a ^ b;                 // add each column, ignoring carries
            b = carry;                 // now add the carries the same way
        }
        // Java ints are 32-bit two's complement, so negatives just work:
        // the carry shifts off the left end after at most 32 rounds
        return a;
    }
}
