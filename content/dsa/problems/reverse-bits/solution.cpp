class Solution {
public:
    int reverseBits(int n) {
        // Work on an unsigned copy so shifting never drags a sign bit along
        uint32_t x = n;
        uint32_t result = 0;
        for (int i = 0; i < 32; i++) {
            // Make room on the right of result, then drop in x's lowest bit.
            // The bit x gives up first ends up furthest left after 32 shifts.
            result = (result << 1) | (x & 1);
            x >>= 1;
        }
        return (int)result;
    }
};
