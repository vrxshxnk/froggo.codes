class Solution {
    public boolean isValid(String s) {
        Map<Character, Character> match = Map.of(')', '(', ']', '[', '}', '{'); // closer -> opener
        Deque<Character> stack = new ArrayDeque<>(); // openers still waiting for their closer

        for (char c : s.toCharArray()) {
            if (match.containsKey(c)) {
                char need = match.get(c); // unbox: comparing two Character objects with != compares references
                // a closer must match the most recent unmatched opener
                if (stack.isEmpty() || stack.peek() != need) return false;
                stack.pop();
            } else {
                stack.push(c);
            }
        }

        return stack.isEmpty(); // leftover openers were never closed
    }
}
