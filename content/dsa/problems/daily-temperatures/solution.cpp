class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n, 0);  // 0 = no warmer day ever comes
        vector<int> stack;         // indices still waiting for a warmer day; their temps only go down

        for (int i = 0; i < n; i++) {
            // today is the warmer day for every colder day still waiting on top
            while (!stack.empty() && temperatures[stack.back()] < temperatures[i]) {
                int j = stack.back();
                stack.pop_back();
                answer[j] = i - j;
            }
            stack.push_back(i);
        }

        return answer;
    }
};
