/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
var characterReplacement = function (s, k) {
  const A = "A".charCodeAt(0);
  const count = new Array(26).fill(0); // letter counts inside s[left..right]
  let left = 0;
  let maxFreq = 0;                     // highest count any letter has reached in a window
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s.charCodeAt(right) - A;
    count[c]++;
    maxFreq = Math.max(maxFreq, count[c]);

    // Letters to repaint = window length - most common letter.
    // More than k? Shrink. maxFreq is never lowered: a stale value only
    // keeps the window at its best size so far, which can't beat best.
    while (right - left + 1 - maxFreq > k) {
      count[s.charCodeAt(left) - A]--;
      left++;
    }

    best = Math.max(best, right - left + 1);
  }

  return best;
};
