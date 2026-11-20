class Solution {
public:
    int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            // n - 1 flips the lowest 1 to 0 and the 0s below it to 1s,
            // so n & (n - 1) is n with exactly its lowest set bit removed
            n &= n - 1;
            count++;
        }
        return count;
    }
};
