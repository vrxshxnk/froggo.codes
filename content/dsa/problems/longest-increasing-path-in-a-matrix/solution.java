class Solution {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    private int rows, cols;
    private int[][] memo;

    public int longestIncreasingPath(int[][] matrix) {
        rows = matrix.length;
        cols = matrix[0].length;
        // memo[r][c] = longest increasing path STARTING at (r, c); 0 = not computed.
        // Strictly increasing paths can never loop back, so this never changes once known.
        memo = new int[rows][cols];

        int best = 0;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                best = Math.max(best, dfs(matrix, r, c));
        return best;
    }

    private int dfs(int[][] matrix, int r, int c) {
        if (memo[r][c] != 0) return memo[r][c];
        int best = 1; // the cell on its own
        for (int[] d : DIRS) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c])
                best = Math.max(best, 1 + dfs(matrix, nr, nc));
        }
        memo[r][c] = best;
        return best;
    }
}
