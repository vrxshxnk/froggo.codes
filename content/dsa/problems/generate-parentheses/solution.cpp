class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        string path;  // the string built so far
        build(n, 0, 0, path, result);
        return result;
    }

private:
    void build(int n, int openCount, int closeCount, string& path, vector<string>& result) {
        if ((int)path.size() == 2 * n) {
            result.push_back(path);
            return;
        }
        // we may open as long as we still have openers left
        if (openCount < n) {
            path.push_back('(');
            build(n, openCount + 1, closeCount, path, result);
            path.pop_back();
        }
        // we may close only if there is an unmatched opener to close
        if (closeCount < openCount) {
            path.push_back(')');
            build(n, openCount, closeCount + 1, path, result);
            path.pop_back();
        }
    }
};
