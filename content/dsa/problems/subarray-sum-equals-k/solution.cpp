class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> count;  // prefix sum -> how many times seen
        count[0] = 1;                   // the empty prefix
        int prefix = 0, answer = 0;

        for (int x : nums) {
            prefix += x;
            auto it = count.find(prefix - k);
            if (it != count.end()) answer += it->second;
            count[prefix]++;            // record AFTER looking up
        }

        return answer;
    }
};
