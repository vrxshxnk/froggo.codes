/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {
  if (s.length !== t.length) return false;

  const count = new Array(26).fill(0); // one slot per letter a..z
  const A = "a".charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - A]++; // letter from s
    count[t.charCodeAt(i) - A]--; // letter from t
  }

  return count.every((c) => c === 0); // anagrams cancel out exactly
};
