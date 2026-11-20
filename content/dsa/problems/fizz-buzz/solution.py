class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        answer = []

        for i in range(1, n + 1):  # 1 to n inclusive, not 0 to n - 1
            if i % 15 == 0:        # most specific rule first, or 15 would stop at "Fizz"
                answer.append("FizzBuzz")
            elif i % 3 == 0:
                answer.append("Fizz")
            elif i % 5 == 0:
                answer.append("Buzz")
            else:
                answer.append(str(i))  # the list holds text, not numbers

        return answer
