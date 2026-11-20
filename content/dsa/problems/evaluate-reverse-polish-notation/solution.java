class Solution {
    public int evalRPN(String[] tokens) {
        // the problem promises every intermediate value fits in 32 bits
        Deque<Integer> stack = new ArrayDeque<>(); // numbers waiting for an operator

        for (String t : tokens) {
            if (t.equals("+") || t.equals("-") || t.equals("*") || t.equals("/")) {
                int b = stack.pop(); // the top is the RIGHT operand
                int a = stack.pop();
                switch (t) {
                    case "+": stack.push(a + b); break;
                    case "-": stack.push(a - b); break;
                    case "*": stack.push(a * b); break;
                    default: stack.push(a / b); // Java division already truncates toward zero
                }
            } else {
                stack.push(Integer.parseInt(t)); // handles "-11" too
            }
        }

        return stack.peek();
    }
}
