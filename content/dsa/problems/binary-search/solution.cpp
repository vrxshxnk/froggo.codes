class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Find the first index with nums[i] >= target (the lower bound).
        // Invariant: that index is always inside [lo, hi]; hi = n means "past the end".
        int lo = 0, hi = (int)nums.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;  // never overflows, and always < hi
            if (nums[mid] >= target) {
                hi = mid;                  // mid might be the answer, so keep it
            } else {
                lo = mid + 1;              // mid and everything left of it are too small
            }
        }

        // lo is where target would sit; it's only a match if it's really there
        if (lo < (int)nums.size() && nums[lo] == target) return lo;
        return -1;
    }
};
