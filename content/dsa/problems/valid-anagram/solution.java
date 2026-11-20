class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;

        int[] count = new int[26]; // one slot per letter a..z
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++; // letter from s
            count[t.charAt(i) - 'a']--; // letter from t
        }

        for (int c : count) {
            if (c != 0) return false; // some letter didn't cancel out
        }
        return true;
    }
}
