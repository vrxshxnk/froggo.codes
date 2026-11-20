class Solution {
    private static final int[][] DIRECTIONS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } }; // down, up, right, left

    public int orangesRotting(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;

        // Multi-source BFS: every rotten orange starts in the queue at minute 0
        ArrayDeque<int[]> queue = new ArrayDeque<>();
        int fresh = 0;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) queue.add(new int[] { r, c });
                else if (grid[r][c] == 1) fresh++;
            }

        int minutes = 0;
        while (!queue.isEmpty() && fresh > 0) {
            // Everything in the queue right now rotted at the same minute: process that whole level
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                int[] cell = queue.poll();
                for (int[] d : DIRECTIONS) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;       // rot it now, so it is queued only once
                        fresh--;
                        queue.add(new int[] { nr, nc });
                    }
                }
            }
            minutes++;
        }

        return fresh == 0 ? minutes : -1;
    }
}
