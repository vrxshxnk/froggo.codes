class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        // the problem promises every intermediate value fits in 32 bits
        stack<int> stack;  // numbers waiting for an operator

        for (const string& t : tokens) {
            if (t == "+" || t == "-" || t == "*" || t == "/") {
                int b = stack.top(); stack.pop();  // the top is the RIGHT operand
                int a = stack.top(); stack.pop();
                if (t == "+") stack.push(a + b);
                else if (t == "-") stack.push(a - b);
                else if (t == "*") stack.push(a * b);
                else stack.push(a / b);  // C++ division already truncates toward zero
            } else {
                stack.push(stoi(t));  // handles "-11" too
            }
        }

        return stack.top();
    }
};
