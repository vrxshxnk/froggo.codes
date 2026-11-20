class KthLargest {
    int k;
    // greater<int> turns C++'s default max-heap into a min-heap
    priority_queue<int, vector<int>, greater<int>> heap;  // the k largest numbers so far

public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }

    int add(int val) {
        heap.push(val);
        if ((int)heap.size() > k) {
            heap.pop();          // drop the smallest: it can never be the k-th largest again
        }
        return heap.top();       // smallest of the top k = the k-th largest
    }
};
