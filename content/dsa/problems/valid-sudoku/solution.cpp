class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        // seen[group][digit]: has this digit appeared in this row/col/box?
        bool rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};

        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;   // empty cells never clash

                int d = board[r][c] - '1';          // '1'..'9' -> 0..8
                int b = (r / 3) * 3 + c / 3;        // which 3x3 box (0..8)
                if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;

                rows[r][d] = cols[c][d] = boxes[b][d] = true;
            }
        }
        return true;
    }
};
