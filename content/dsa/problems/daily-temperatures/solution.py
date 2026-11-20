class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)  # 0 = no warmer day ever comes
        stack = []  # indices still waiting for a warmer day; their temps only go down

        for i, t in enumerate(temperatures):
            # today is the warmer day for every colder day still waiting on top
            while stack and temperatures[stack[-1]] < t:
                j = stack.pop()
                answer[j] = i - j
            stack.append(i)

        return answer
