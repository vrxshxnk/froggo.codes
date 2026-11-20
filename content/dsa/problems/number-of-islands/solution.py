from collections import deque


class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))  # down, up, right, left
        islands = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != "1":
                    continue
                # Unvisited land: a new island. Flood all of it so we never count it again.
                islands += 1
                grid[r][c] = "0"             # mark when we ADD to the queue, not when we pop
                queue = deque([(r, c)])
                while queue:
                    cr, cc = queue.popleft()
                    for dr, dc in directions:
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                            grid[nr][nc] = "0"
                            queue.append((nr, nc))

        return islands
