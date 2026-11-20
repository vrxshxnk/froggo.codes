class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;

        while (left < right) {
            int total = numbers[left] + numbers[right];
            if (total == target) {
                return new int[] { left + 1, right + 1 }; // the answer is 1-indexed
            }
            if (total < target) {
                // numbers[left] is too small even with the biggest partner left,
                // so it can't be in any answer: drop it
                left++;
            } else {
                // numbers[right] is too big even with the smallest partner left
                right--;
            }
        }

        return new int[0]; // guaranteed answer, never reached
    }
}
