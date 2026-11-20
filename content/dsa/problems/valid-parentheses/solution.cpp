class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> match = {{')', '('}, {']', '['}, {'}', '{'}};  // closer -> opener
        stack<char> stack;  // openers still waiting for their closer

        for (char c : s) {
            if (match.count(c)) {
                // a closer must match the most recent unmatched opener
                if (stack.empty() || stack.top() != match[c]) return false;
                stack.pop();
            } else {
                stack.push(c);
            }
        }

        return stack.empty();  // leftover openers were never closed
    }
};
