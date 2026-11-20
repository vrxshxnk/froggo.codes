class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> path;  // the subset we are building right now
        backtrack(nums, 0, path, result);
        return result;
    }

private:
    void backtrack(const vector<int>& nums, int start, vector<int>& path, vector<vector<int>>& result) {
        // Every node of the decision tree is a valid subset, so record it on arrival
        result.push_back(path);  // push_back copies the vector
        for (int i = start; i < (int)nums.size(); i++) {
            path.push_back(nums[i]);                // choose
            backtrack(nums, i + 1, path, result);   // explore: only later elements, so no repeats
            path.pop_back();                        // un-choose
        }
    }
};
