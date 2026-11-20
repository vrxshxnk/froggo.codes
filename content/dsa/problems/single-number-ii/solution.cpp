class Solution {
public:
    int singleNumber(vector<int>& nums) {
        uint32_t result = 0;
        for (int bit = 0; bit < 32; bit++) {
            // Every number that appears three times adds 0 or 3 to this column,
            // so whatever is left after % 3 is the single number's bit
            int count = 0;
            for (int x : nums) {
                count += ((uint32_t)x >> bit) & 1;  // unsigned: plain bit pattern, no sign tricks
            }
            if (count % 3 != 0) {
                result |= 1u << bit;
            }
        }
        return (int)result;  // the 32 bits already are the two's complement answer
    }
};
