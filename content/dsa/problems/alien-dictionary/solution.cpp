class Solution {
public:
    string alienOrder(vector<string>& words) {
        // letters are nodes 0..25; edge[x][y] means "x comes before y"
        vector<bool> present(26, false);
        for (auto& w : words)
            for (char ch : w) present[ch - 'a'] = true;
        vector<vector<bool>> edge(26, vector<bool>(26, false));
        vector<int> indegree(26, 0);

        // only ADJACENT words give rules, and only at their first differing letter
        for (int k = 0; k + 1 < (int)words.size(); k++) {
            const string& a = words[k];
            const string& b = words[k + 1];
            int i = 0;
            while (i < (int)a.size() && i < (int)b.size() && a[i] == b[i]) i++;
            if (i == (int)a.size() || i == (int)b.size()) {  // one is a prefix of the other
                if (a.size() > b.size()) return "";          // "abc" before "ab" is impossible
                continue;                                    // "ab" before "abc" says nothing
            }
            int x = a[i] - 'a', y = b[i] - 'a';
            if (!edge[x][y]) {  // skip duplicate rules so indegrees stay right
                edge[x][y] = true;
                indegree[y]++;
            }
        }

        // Kahn's algorithm: repeatedly output a letter nothing else must precede
        queue<int> q;
        int letters = 0;
        for (int c = 0; c < 26; c++) {
            if (present[c]) letters++;
            if (present[c] && indegree[c] == 0) q.push(c);
        }
        string order;
        while (!q.empty()) {
            int x = q.front();
            q.pop();
            order += char('a' + x);
            for (int y = 0; y < 26; y++) {
                if (edge[x][y] && --indegree[y] == 0) q.push(y);
            }
        }

        // letters left over are stuck in a cycle: no valid order exists
        return (int)order.size() == letters ? order : "";
    }
};
