class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        // priority_queue is a MAX-heap by default: top() is the heaviest stone
        priority_queue<int> heap(stones.begin(), stones.end());

        while (heap.size() > 1) {
            int y = heap.top(); heap.pop();  // heaviest
            int x = heap.top(); heap.pop();  // second heaviest, so x <= y
            if (y != x) {
                heap.push(y - x);            // the leftover piece goes back in
            }
        }

        return heap.empty() ? 0 : heap.top();
    }
};
