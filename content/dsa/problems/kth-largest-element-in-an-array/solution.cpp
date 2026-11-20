class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        // greater<int> turns C++'s default max-heap into a min-heap
        priority_queue<int, vector<int>, greater<int>> heap;  // the k largest so far
        for (int x : nums) {
            heap.push(x);
            if ((int)heap.size() > k) {
                heap.pop();      // the smallest of k + 1 can't be in the top k
            }
        }
        return heap.top();       // smallest of the top k = the k-th largest
    }
};
