class Solution {
    public String alienOrder(String[] words) {
        // letters are nodes 0..25; edge[x][y] means "x comes before y"
        boolean[] present = new boolean[26];
        for (String w : words)
            for (char ch : w.toCharArray()) present[ch - 'a'] = true;
        boolean[][] edge = new boolean[26][26];
        int[] indegree = new int[26];

        // only ADJACENT words give rules, and only at their first differing letter
        for (int k = 0; k + 1 < words.length; k++) {
            String a = words[k], b = words[k + 1];
            int i = 0;
            while (i < a.length() && i < b.length() && a.charAt(i) == b.charAt(i)) i++;
            if (i == a.length() || i == b.length()) { // one is a prefix of the other
                if (a.length() > b.length()) return ""; // "abc" before "ab" is impossible
                continue;                               // "ab" before "abc" says nothing
            }
            int x = a.charAt(i) - 'a', y = b.charAt(i) - 'a';
            if (!edge[x][y]) { // skip duplicate rules so indegrees stay right
                edge[x][y] = true;
                indegree[y]++;
            }
        }

        // Kahn's algorithm: repeatedly output a letter nothing else must precede
        Deque<Integer> queue = new ArrayDeque<>();
        int letters = 0;
        for (int c = 0; c < 26; c++) {
            if (present[c]) letters++;
            if (present[c] && indegree[c] == 0) queue.add(c);
        }
        StringBuilder order = new StringBuilder();
        while (!queue.isEmpty()) {
            int x = queue.poll();
            order.append((char) ('a' + x));
            for (int y = 0; y < 26; y++) {
                if (edge[x][y] && --indegree[y] == 0) queue.add(y);
            }
        }

        // letters left over are stuck in a cycle: no valid order exists
        return order.length() == letters ? order.toString() : "";
    }
}
