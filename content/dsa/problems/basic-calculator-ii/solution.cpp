class Solution {
public:
    int calculate(string s) {
        vector<int> stack;  // signed terms; the answer is their sum
        int num = 0;        // the number we are reading right now
        char op = '+';      // the operator that came BEFORE num
        int n = s.size();

        for (int i = 0; i < n; i++) {
            char c = s[i];
            if (isdigit(c)) num = num * 10 + (c - '0');
            // an operator (or the end of the string) means num is complete
            if (c == '+' || c == '-' || c == '*' || c == '/' || i == n - 1) {
                if (op == '+') stack.push_back(num);
                else if (op == '-') stack.push_back(-num);
                else if (op == '*') stack.back() *= num;  // * binds tighter: fold into the last term now
                else stack.back() /= num;                  // C++ division already truncates toward zero
                op = c;
                num = 0;
            }
        }

        int result = 0;
        for (int term : stack) result += term;
        return result;
    }
};
