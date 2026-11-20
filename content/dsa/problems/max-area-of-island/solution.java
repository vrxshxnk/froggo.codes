class Solution {
    private static final int[][] DIRECTIONS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } }; // down, up, right, left

    public int maxAreaOfIsland(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int best = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1) continue;
                // New island: count its cells with an iterative DFS (an explicit stack, no recursion)
                int area = 0;
                grid[r][c] = 0;                 // mark when pushed, so no cell is counted twice
                ArrayDeque<int[]> stack = new ArrayDeque<>();
                stack.push(new int[] { r, c });
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    area++;
                    for (int[] d : DIRECTIONS) {
                        int nr = cell[0] + d[0], nc = cell[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                            grid[nr][nc] = 0;
                            stack.push(new int[] { nr, nc });
                        }
                    }
                }
                best = Math.max(best, area);
            }
        }
        return best;
    }
}
