class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> unvisited = new HashSet<>(wordList);
        if (!unvisited.contains(endWord)) return 0;
        unvisited.remove(beginWord);

        Deque<String> queue = new ArrayDeque<>();
        queue.add(beginWord);
        int steps = 1; // number of words in the sequence, counting beginWord

        while (!queue.isEmpty()) {
            for (int k = queue.size(); k > 0; k--) { // one BFS level = one more word
                String word = queue.poll();
                if (word.equals(endWord)) return steps;

                char[] chars = word.toCharArray();
                for (int i = 0; i < chars.length; i++) {
                    char original = chars[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == original) continue;
                        chars[i] = c;
                        String next = new String(chars);
                        if (unvisited.remove(next)) { // true only if it was there: mark visited on enqueue
                            queue.add(next);
                        }
                    }
                    chars[i] = original; // undo before the next position
                }
            }
            steps++;
        }

        return 0;
    }
}
