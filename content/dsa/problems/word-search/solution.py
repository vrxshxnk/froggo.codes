class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))  # down, up, right, left

        def dfs(r: int, c: int, k: int) -> bool:
            # Can word[k:] be spelled starting at cell (r, c)?
            if board[r][c] != word[k]:
                return False
            if k == len(word) - 1:
                return True                   # matched the last letter
            saved = board[r][c]
            board[r][c] = "#"                 # choose: mark visited so this path can't reuse the cell
            found = False
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and dfs(nr, nc, k + 1):
                    found = True
                    break
            board[r][c] = saved               # un-choose: other paths may still use this cell
            return found

        for r in range(rows):
            for c in range(cols):
                if dfs(r, c, 0):
                    return True
        return False
