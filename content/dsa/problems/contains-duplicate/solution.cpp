class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;

        for (int x : nums) {
            if (seen.count(x)) {   // already met this value -> duplicate
                return true;
            }
            seen.insert(x);
        }

        return false;              // every value was unique
    }
};
