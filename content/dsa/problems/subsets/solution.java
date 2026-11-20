class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
        // Every node of the decision tree is a valid subset, so record it on arrival
        result.add(new ArrayList<>(path)); // copy: path keeps changing after this
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);                    // choose
            backtrack(nums, i + 1, path, result); // explore: only later elements, so no repeats
            path.remove(path.size() - 1);         // un-choose (by index, not by value)
        }
    }
}
