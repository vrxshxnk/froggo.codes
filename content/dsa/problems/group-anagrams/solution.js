/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  const groups = new Map(); // key -> words sharing that key

  for (const word of strs) {
    const key = [...word].sort().join(""); // "eat" -> "aet"
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }

  return [...groups.values()];
};
