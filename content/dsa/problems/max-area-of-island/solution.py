class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))  # down, up, right, left
        best = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != 1:
                    continue
                # New island: count its cells with an iterative DFS (an explicit stack, no recursion)
                area = 0
                grid[r][c] = 0                # mark when pushed, so no cell is counted twice
                stack = [(r, c)]
                while stack:
                    cr, cc = stack.pop()
                    area += 1
                    for dr, dc in directions:
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 0
                            stack.append((nr, nc))
                best = max(best, area)

        return best
