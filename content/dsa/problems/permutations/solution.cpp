class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> path;
        vector<bool> used(nums.size(), false);  // used[i]: is nums[i] already in path?
        backtrack(nums, used, path, result);
        return result;
    }

private:
    void backtrack(const vector<int>& nums, vector<bool>& used, vector<int>& path,
                   vector<vector<int>>& result) {
        if (path.size() == nums.size()) {
            result.push_back(path);  // a full arrangement; push_back copies it
            return;
        }
        for (int i = 0; i < (int)nums.size(); i++) {  // any unused number may go next
            if (used[i]) continue;
            used[i] = true;                 // choose
            path.push_back(nums[i]);
            backtrack(nums, used, path, result);  // explore
            path.pop_back();                // un-choose: undo BOTH changes
            used[i] = false;
        }
    }
};
