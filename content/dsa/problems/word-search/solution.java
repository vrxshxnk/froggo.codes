class Solution {
    private static final int[][] DIRECTIONS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } }; // down, up, right, left

    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }

    // Can word[k..] be spelled starting at cell (r, c)?
    private boolean dfs(char[][] board, String word, int r, int c, int k) {
        if (board[r][c] != word.charAt(k)) return false;
        if (k == word.length() - 1) return true; // matched the last letter

        char saved = board[r][c];
        board[r][c] = '#';     // choose: mark visited so this path can't reuse the cell
        boolean found = false;
        for (int[] d : DIRECTIONS) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length
                    && dfs(board, word, nr, nc, k + 1)) {
                found = true;
                break;
            }
        }
        board[r][c] = saved;   // un-choose: other paths may still use this cell
        return found;
    }
}
