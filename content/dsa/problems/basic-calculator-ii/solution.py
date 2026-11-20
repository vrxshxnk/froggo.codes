class Solution:
    def calculate(self, s: str) -> int:
        stack = []  # signed terms; the answer is their sum
        num = 0     # the number we are reading right now
        op = "+"    # the operator that came BEFORE num

        for i, c in enumerate(s):
            if c.isdigit():
                num = num * 10 + int(c)
            # an operator (or the end of the string) means num is complete
            if c in "+-*/" or i == len(s) - 1:
                if op == "+":
                    stack.append(num)
                elif op == "-":
                    stack.append(-num)
                elif op == "*":
                    stack.append(stack.pop() * num)  # * binds tighter: fold into the last term now
                else:
                    # truncate toward zero; // would floor -3 // 2 to -2 instead of -1
                    stack.append(int(stack.pop() / num))
                op = c
                num = 0

        return sum(stack)
