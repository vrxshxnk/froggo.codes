class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());  // lets a loop stop once a number is too big
        vector<vector<int>> result;
        vector<int> path;
        backtrack(candidates, 0, target, path, result);
        return result;
    }

private:
    void backtrack(const vector<int>& candidates, int start, int remaining,
                   vector<int>& path, vector<vector<int>>& result) {
        if (remaining == 0) {
            result.push_back(path);  // push_back copies the vector
            return;
        }
        for (int i = start; i < (int)candidates.size(); i++) {
            int c = candidates[i];
            if (c > remaining) break;                           // every later candidate is even bigger
            path.push_back(c);                                  // choose
            backtrack(candidates, i, remaining - c, path, result);  // i, not i + 1: c can be reused
            path.pop_back();                                    // un-choose
        }
    }
};
