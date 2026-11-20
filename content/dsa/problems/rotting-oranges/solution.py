from collections import deque


class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))  # down, up, right, left

        # Multi-source BFS: every rotten orange starts in the queue at minute 0
        queue = deque()
        fresh = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1

        minutes = 0
        while queue and fresh > 0:
            # Everything in the queue right now rotted at the same minute: process that whole level
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2          # rot it now, so it is queued only once
                        fresh -= 1
                        queue.append((nr, nc))
            minutes += 1

        return minutes if fresh == 0 else -1
