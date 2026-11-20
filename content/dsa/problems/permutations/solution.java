class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length]; // used[i]: is nums[i] already in path?
        backtrack(nums, used, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path)); // a full arrangement; copy it
            return;
        }
        for (int i = 0; i < nums.length; i++) { // any unused number may go next, so start at 0
            if (used[i]) continue;
            used[i] = true;                      // choose
            path.add(nums[i]);
            backtrack(nums, used, path, result); // explore
            path.remove(path.size() - 1);        // un-choose: undo BOTH changes
            used[i] = false;
        }
    }
}
