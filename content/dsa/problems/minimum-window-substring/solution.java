class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128]; // need[c] = copies of c the window still owes us (negative = spare)
        for (char c : t.toCharArray()) need[c]++;
        int missing = t.length(); // characters of t not yet covered by the window

        int bestStart = 0, bestLen = Integer.MAX_VALUE;
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            // Grow: take s[right]. It only helps if the window still owed us one.
            char c = s.charAt(right);
            if (need[c] > 0) missing--;
            need[c]--;

            // Shrink: while the window is valid, record it and drop the left char.
            while (missing == 0) {
                if (right - left + 1 < bestLen) {
                    bestStart = left;
                    bestLen = right - left + 1;
                }
                char out = s.charAt(left);
                need[out]++;
                if (need[out] > 0) missing++; // we just gave away a char we needed
                left++;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
    }
}
