class Solution {
    private static final int[][] DIRECTIONS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } }; // down, up, right, left

    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        int rows = heights.length, cols = heights[0].length;
        List<int[]> pacificShore = new ArrayList<>(), atlanticShore = new ArrayList<>();
        for (int c = 0; c < cols; c++) {
            pacificShore.add(new int[] { 0, c });
            atlanticShore.add(new int[] { rows - 1, c });
        }
        for (int r = 0; r < rows; r++) {
            pacificShore.add(new int[] { r, 0 });
            atlanticShore.add(new int[] { r, cols - 1 });
        }
        boolean[][] pacific = reachable(heights, pacificShore);
        boolean[][] atlantic = reachable(heights, atlanticShore);

        List<List<Integer>> result = new ArrayList<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pacific[r][c] && atlantic[r][c]) result.add(Arrays.asList(r, c));
        return result;
    }

    // Multi-source BFS from an ocean's shore, walking UPHILL (water flowing backwards).
    private boolean[][] reachable(int[][] heights, List<int[]> starts) {
        int rows = heights.length, cols = heights[0].length;
        boolean[][] seen = new boolean[rows][cols];
        ArrayDeque<int[]> queue = new ArrayDeque<>();
        for (int[] s : starts) {
            if (!seen[s[0]][s[1]]) {
                seen[s[0]][s[1]] = true;
                queue.add(s);
            }
        }
        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            int r = cell[0], c = cell[1];
            for (int[] d : DIRECTIONS) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc]
                        && heights[nr][nc] >= heights[r][c]) { // water could flow nr,nc -> r,c
                    seen[nr][nc] = true;
                    queue.add(new int[] { nr, nc });
                }
            }
        }
        return seen;
    }
}
