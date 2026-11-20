class Solution:
    def isValid(self, s: str) -> bool:
        match = {")": "(", "]": "[", "}": "{"}  # closer -> the opener it needs
        stack = []                              # openers still waiting for their closer

        for c in s:
            if c in match:
                # a closer must match the most recent unmatched opener
                if not stack or stack[-1] != match[c]:
                    return False
                stack.pop()
            else:
                stack.append(c)

        return not stack  # leftover openers were never closed
