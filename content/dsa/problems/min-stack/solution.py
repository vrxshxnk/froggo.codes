class MinStack:
    def __init__(self):
        # each entry is (value, smallest value at or below this entry)
        self.stack = []

    def push(self, val: int) -> None:
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self) -> None:
        # the entry below still remembers the minimum from before this push
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]
