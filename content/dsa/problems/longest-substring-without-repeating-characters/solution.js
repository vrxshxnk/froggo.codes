/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  const window = new Set(); // the characters inside s[left..right]; all distinct
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    // Adding c would create a repeat: shrink from the left until
    // the old copy of c has left the window
    while (window.has(c)) {
      window.delete(s[left]);
      left++;
    }

    window.add(c);
    best = Math.max(best, right - left + 1); // the window is valid again
  }

  return best;
};
