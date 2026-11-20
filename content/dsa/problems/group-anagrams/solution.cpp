class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups; // key -> words sharing it

        for (const string& word : strs) {
            string key = word;
            sort(key.begin(), key.end());              // "eat" -> "aet"
            groups[key].push_back(word);
        }

        vector<vector<string>> result;
        for (auto& [key, words] : groups) {
            result.push_back(words);
        }
        return result;
    }
};
