class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>(); // prefix sum -> times seen
        count.put(0, 1);                               // the empty prefix
        int prefix = 0, answer = 0;

        for (int x : nums) {
            prefix += x;
            answer += count.getOrDefault(prefix - k, 0);
            count.merge(prefix, 1, Integer::sum);      // record AFTER looking up
        }

        return answer;
    }
}
