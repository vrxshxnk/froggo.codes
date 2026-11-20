class Solution {
    public int numDistinct(String s, String t) {
        int m = t.length();
        // dp[j] = number of ways to build t[0..j) from the part of s read so far.
        // long: some cells that never reach the answer can still overflow; Java just
        // wraps them, and the answer itself is guaranteed to fit in an int.
        long[] dp = new long[m + 1];
        dp[0] = 1; // the empty prefix: one way, pick nothing

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            // Right to left so dp[j - 1] is still the value from BEFORE this char.
            for (int j = m; j >= 1; j--) {
                if (t.charAt(j - 1) == c) dp[j] += dp[j - 1]; // use c as t[j-1], plus the ways that skip it
            }
        }
        return (int) dp[m];
    }
}
