/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function (s, t) {
  const need = new Array(128).fill(0); // need[c] = copies of c the window still owes us (negative = spare)
  for (const c of t) need[c.charCodeAt(0)]++;
  let missing = t.length; // characters of t not yet covered by the window

  let bestStart = 0, bestLen = Infinity;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    // Grow: take s[right]. It only helps if the window still owed us one.
    const c = s.charCodeAt(right);
    if (need[c] > 0) missing--;
    need[c]--;

    // Shrink: while the window is valid, record it and drop the left char.
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestStart = left;
        bestLen = right - left + 1;
      }
      const out = s.charCodeAt(left);
      need[out]++;
      if (need[out] > 0) missing++; // we just gave away a char we needed
      left++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
};
