class MedianFinder {
public:
    MedianFinder() {}

    void addNum(int num) {
        // Push through low first, so the largest of the small half moves up to
        // high. That keeps every element of low <= every element of high.
        low.push(num);
        high.push(low.top());
        low.pop();
        // Rebalance: low may be bigger by one, never smaller.
        if (high.size() > low.size()) {
            low.push(high.top());
            high.pop();
        }
    }

    double findMedian() {
        if (low.size() > high.size()) return low.top();  // odd count: the middle is low's top
        return ((double)low.top() + high.top()) / 2.0;   // cast first: the sum can overflow int
    }

private:
    // low = smaller half (max-heap), high = larger half (min-heap).
    // Invariant: low.size() == high.size() or low.size() == high.size() + 1.
    priority_queue<int> low;
    priority_queue<int, vector<int>, greater<int>> high;
};
