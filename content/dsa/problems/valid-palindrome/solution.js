/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  const isAlnum = (c) => /[a-zA-Z0-9]/.test(c);
  let left = 0, right = s.length - 1;

  while (left < right) {
    // Skip anything that isn't a letter or digit: it doesn't count
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;

    // Compare case-insensitively: 'A' and 'a' are the same letter
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    // This pair matched, so both ends move inwards
    left++;
    right--;
  }

  return true; // the pointers met without a mismatch
};
