class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;  // value -> index of every number we've passed

        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            auto it = seen.find(need);
            if (it != seen.end()) {        // partner already seen?
                return {it->second, i};
            }
            seen[nums[i]] = i;             // store AFTER checking
        }

        return {};  // guaranteed answer, never reached
    }
};
