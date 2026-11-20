class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]

        for r in range(9):
            for c in range(9):
                d = board[r][c]
                if d == ".":
                    continue                       # empty cells never clash

                b = (r // 3) * 3 + c // 3          # which 3x3 box (0..8)
                if d in rows[r] or d in cols[c] or d in boxes[b]:
                    return False                   # digit repeated in a group

                rows[r].add(d)
                cols[c].add(d)
                boxes[b].add(d)

        return True
