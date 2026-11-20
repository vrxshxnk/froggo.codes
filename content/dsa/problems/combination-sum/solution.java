class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates); // lets a loop stop once a number is too big
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int start, int remaining,
                           List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path)); // copy: path keeps changing after this
            return;
        }
        for (int i = start; i < candidates.length; i++) {
            int c = candidates[i];
            if (c > remaining) break;                             // every later candidate is even bigger
            path.add(c);                                          // choose
            backtrack(candidates, i, remaining - c, path, result); // i, not i + 1: c can be reused
            path.remove(path.size() - 1);                         // un-choose
        }
    }
}
