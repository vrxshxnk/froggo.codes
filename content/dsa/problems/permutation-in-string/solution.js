/**
 * @param {string} s1
 * @param {string} s2
 * @return {boolean}
 */
var checkInclusion = function (s1, s2) {
  const a = "a".charCodeAt(0);
  const m = s1.length;
  const need = new Array(26).fill(0); // need[c] = copies of c in s1 minus copies in the window
  for (let i = 0; i < m; i++) need[s1.charCodeAt(i) - a]++;
  let missing = m;                    // letters of s1 the window still lacks

  for (let right = 0; right < s2.length; right++) {
    // The window grows by s2[right]
    const c = s2.charCodeAt(right) - a;
    if (need[c] > 0) missing--; // it filled a gap; an extra copy fills nothing
    need[c]--;

    // Keep the window exactly m long: drop the letter that falls out
    if (right >= m) {
      const out = s2.charCodeAt(right - m) - a;
      need[out]++;
      if (need[out] > 0) missing++; // we just lost a letter s1 needed
    }

    // m letters with nothing missing means the same letters as s1
    if (missing === 0) return true;
  }

  return false;
};
