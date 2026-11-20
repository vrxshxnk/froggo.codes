class MinStack {
    // each entry is {value, smallest value at or below this entry}
    vector<pair<int, int>> stack;

public:
    MinStack() {}

    void push(int val) {
        int currentMin = stack.empty() ? val : min(val, stack.back().second);
        stack.push_back({val, currentMin});
    }

    void pop() {
        // the entry below still remembers the minimum from before this push
        stack.pop_back();
    }

    int top() {
        return stack.back().first;
    }

    int getMin() {
        return stack.back().second;
    }
};
