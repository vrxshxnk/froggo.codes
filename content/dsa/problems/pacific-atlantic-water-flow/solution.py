from collections import deque


class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))  # down, up, right, left

        def reachable(starts: List[Tuple[int, int]]) -> List[List[bool]]:
            # Multi-source BFS from an ocean's shore, walking UPHILL (water flowing backwards).
            seen = [[False] * cols for _ in range(rows)]
            queue = deque()
            for r, c in starts:
                if not seen[r][c]:
                    seen[r][c] = True
                    queue.append((r, c))
            while queue:
                r, c = queue.popleft()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if (0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc]
                            and heights[nr][nc] >= heights[r][c]):  # water could flow nr,nc -> r,c
                        seen[nr][nc] = True
                        queue.append((nr, nc))
            return seen

        pacific_shore = [(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)]
        atlantic_shore = [(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)]
        pacific = reachable(pacific_shore)
        atlantic = reachable(atlantic_shore)

        return [[r, c] for r in range(rows) for c in range(cols) if pacific[r][c] and atlantic[r][c]]
