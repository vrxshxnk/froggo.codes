class Solution {
    public String longestPalindrome(String s) {
        int n = s.length();
        // dp[i][j] = true when s[i..j] (both ends included) reads the same both ways
        boolean[][] dp = new boolean[n][n];
        int start = 0, best = 1; // any single character is a palindrome

        // dp[i][j] needs dp[i+1][j-1], the row below, so fill rows from the bottom up
        for (int i = n - 1; i >= 0; i--) {
            for (int j = i; j < n; j++) {
                // ends must match; lengths 1 and 2 have no middle left to check
                if (s.charAt(i) == s.charAt(j) && (j - i < 2 || dp[i + 1][j - 1])) {
                    dp[i][j] = true;
                    if (j - i + 1 > best) {
                        start = i;
                        best = j - i + 1;
                    }
                }
            }
        }

        return s.substring(start, start + best);
    }
}
