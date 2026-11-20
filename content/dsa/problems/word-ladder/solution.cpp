class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> unvisited(wordList.begin(), wordList.end());
        if (!unvisited.count(endWord)) return 0;
        unvisited.erase(beginWord);

        queue<string> q;
        q.push(beginWord);
        int steps = 1;  // number of words in the sequence, counting beginWord

        while (!q.empty()) {
            for (int k = q.size(); k > 0; k--) {  // one BFS level = one more word
                string word = q.front();
                q.pop();
                if (word == endWord) return steps;

                for (int i = 0; i < (int)word.size(); i++) {
                    char original = word[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == original) continue;
                        word[i] = c;
                        if (unvisited.count(word)) {
                            unvisited.erase(word);  // mark visited when we enqueue
                            q.push(word);
                        }
                    }
                    word[i] = original;  // undo before the next position
                }
            }
            steps++;
        }

        return 0;
    }
};
