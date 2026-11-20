class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int n = nums.size();

        // Lower bound: first index with nums[i] >= target, i.e. the first copy.
        int lo = 0, hi = n;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] >= target) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        int first = lo;

        // Landing past the end, or on a bigger number, means target is missing
        if (first == n || nums[first] != target) return {-1, -1};

        // Upper bound: first index with nums[i] > target, i.e. one PAST the last copy.
        lo = 0, hi = n;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > target) {  // the only change: > instead of >=
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        int upper = lo;

        return {first, upper - 1};
    }
};
