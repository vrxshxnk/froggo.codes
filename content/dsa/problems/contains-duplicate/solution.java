class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();

        for (int x : nums) {
            // add() returns false when x was already in the set
            if (!seen.add(x)) {
                return true;
            }
        }

        return false; // every value was unique
    }
}
