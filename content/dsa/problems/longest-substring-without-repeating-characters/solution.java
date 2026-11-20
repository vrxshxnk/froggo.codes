class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>(); // the characters inside s[left..right]; all distinct
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            // Adding c would create a repeat: shrink from the left until
            // the old copy of c has left the window
            while (window.contains(c)) {
                window.remove(s.charAt(left));
                left++;
            }

            window.add(c);
            best = Math.max(best, right - left + 1); // the window is valid again
        }

        return best;
    }
}
