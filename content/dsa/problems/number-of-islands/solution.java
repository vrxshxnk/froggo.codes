class Solution {
    private static final int[][] DIRECTIONS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } }; // down, up, right, left

    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int islands = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                // Unvisited land: a new island. Flood all of it so we never count it again.
                islands++;
                grid[r][c] = '0';               // mark when we ADD to the queue, not when we pop
                ArrayDeque<int[]> queue = new ArrayDeque<>();
                queue.add(new int[] { r, c });
                while (!queue.isEmpty()) {
                    int[] cell = queue.poll();
                    for (int[] d : DIRECTIONS) {
                        int nr = cell[0] + d[0], nc = cell[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            queue.add(new int[] { nr, nc });
                        }
                    }
                }
            }
        }
        return islands;
    }
}
