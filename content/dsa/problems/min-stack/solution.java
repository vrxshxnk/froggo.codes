class MinStack {
    // each entry is {value, smallest value at or below this entry}
    private final Deque<int[]> stack = new ArrayDeque<>();

    public MinStack() {}

    public void push(int val) {
        int currentMin = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[] { val, currentMin });
    }

    public void pop() {
        // the entry below still remembers the minimum from before this push
        stack.pop();
    }

    public int top() {
        return stack.peek()[0];
    }

    public int getMin() {
        return stack.peek()[1];
    }
}
