class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26]; // letter counts inside s[left..right]
        int left = 0;
        int maxFreq = 0;           // highest count any letter has reached in a window
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            count[s.charAt(right) - 'A']++;
            maxFreq = Math.max(maxFreq, count[s.charAt(right) - 'A']);

            // Letters to repaint = window length - most common letter.
            // More than k? Shrink. maxFreq is never lowered: a stale value only
            // keeps the window at its best size so far, which can't beat best.
            while ((right - left + 1) - maxFreq > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}
