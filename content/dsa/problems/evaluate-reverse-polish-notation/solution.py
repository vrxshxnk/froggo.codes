class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []  # numbers waiting for an operator

        for t in tokens:
            if t in ("+", "-", "*", "/"):
                b = stack.pop()  # the top is the RIGHT operand
                a = stack.pop()
                if t == "+":
                    stack.append(a + b)
                elif t == "-":
                    stack.append(a - b)
                elif t == "*":
                    stack.append(a * b)
                else:
                    # truncate toward zero; Python's // floors, so -7 // 2 would give -4
                    stack.append(int(a / b))
            else:
                stack.append(int(t))  # handles "-11" too

        return stack[-1]
