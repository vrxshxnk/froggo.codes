/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function (x) {
  if (x < 0) {               // "-121" backwards is "121-": never a palindrome
    return false;
  }

  const original = x;
  let rev = 0;               // JS numbers are exact up to 2^53, so no overflow here
  while (x > 0) {
    const digit = x % 10;    // last digit
    rev = rev * 10 + digit;  // shift left, append the digit
    x = Math.floor(x / 10);  // chop the last digit off (plain / would give decimals)
  }

  return rev === original;
};
