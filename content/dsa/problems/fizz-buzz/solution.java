class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> answer = new ArrayList<>();

        for (int i = 1; i <= n; i++) {     // 1 to n inclusive, not 0 to n - 1
            if (i % 15 == 0) {             // most specific rule first, or 15 would stop at "Fizz"
                answer.add("FizzBuzz");
            } else if (i % 3 == 0) {
                answer.add("Fizz");
            } else if (i % 5 == 0) {
                answer.add("Buzz");
            } else {
                answer.add(String.valueOf(i));  // the list holds text, not numbers
            }
        }

        return answer;
    }
}
