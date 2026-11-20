class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        result = []
        path = []  # the string built so far, as a list for cheap append/pop

        def build(open_count: int, close_count: int) -> None:
            if len(path) == 2 * n:
                result.append("".join(path))
                return
            # we may open as long as we still have openers left
            if open_count < n:
                path.append("(")
                build(open_count + 1, close_count)
                path.pop()
            # we may close only if there is an unmatched opener to close
            if close_count < open_count:
                path.append(")")
                build(open_count, close_count + 1)
                path.pop()

        build(0, 0)
        return result
