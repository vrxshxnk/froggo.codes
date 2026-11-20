from collections import defaultdict


class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)          # key -> words sharing that key

        for word in strs:
            key = "".join(sorted(word))     # "eat", "tea", "ate" -> "aet"
            groups[key].append(word)

        return list(groups.values())
