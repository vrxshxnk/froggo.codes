class Solution {
public:
    vector<string> fizzBuzz(int n) {
        vector<string> answer;

        for (int i = 1; i <= n; i++) {     // 1 to n inclusive, not 0 to n - 1
            if (i % 15 == 0) {             // most specific rule first, or 15 would stop at "Fizz"
                answer.push_back("FizzBuzz");
            } else if (i % 3 == 0) {
                answer.push_back("Fizz");
            } else if (i % 5 == 0) {
                answer.push_back("Buzz");
            } else {
                answer.push_back(to_string(i));  // the list holds text, not numbers
            }
        }

        return answer;
    }
};
