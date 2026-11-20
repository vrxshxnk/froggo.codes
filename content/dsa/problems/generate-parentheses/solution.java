class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        build(n, 0, 0, new StringBuilder(), result); // path = the string built so far
        return result;
    }

    private void build(int n, int openCount, int closeCount, StringBuilder path, List<String> result) {
        if (path.length() == 2 * n) {
            result.add(path.toString());
            return;
        }
        // we may open as long as we still have openers left
        if (openCount < n) {
            path.append('(');
            build(n, openCount + 1, closeCount, path, result);
            path.deleteCharAt(path.length() - 1);
        }
        // we may close only if there is an unmatched opener to close
        if (closeCount < openCount) {
            path.append(')');
            build(n, openCount, closeCount + 1, path, result);
            path.deleteCharAt(path.length() - 1);
        }
    }
}
