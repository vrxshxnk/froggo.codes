class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] answer = new int[n];  // 0 = no warmer day ever comes
        int[] stack = new int[n];   // indices still waiting for a warmer day; their temps only go down
        int size = 0;               // stack[0..size) is the live part

        for (int i = 0; i < n; i++) {
            // today is the warmer day for every colder day still waiting on top
            while (size > 0 && temperatures[stack[size - 1]] < temperatures[i]) {
                int j = stack[--size];
                answer[j] = i - j;
            }
            stack[size++] = i;
        }

        return answer;
    }
}
