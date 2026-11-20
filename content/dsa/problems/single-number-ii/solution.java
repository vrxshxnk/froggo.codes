class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int bit = 0; bit < 32; bit++) {
            // Every number that appears three times adds 0 or 3 to this column,
            // so whatever is left after % 3 is the single number's bit
            int count = 0;
            for (int x : nums) {
                count += (x >> bit) & 1;
            }
            if (count % 3 != 0) {
                result |= 1 << bit;  // setting bit 31 makes result negative, exactly as it should
            }
        }
        return result;
    }
}
