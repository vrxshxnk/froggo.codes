/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
var getSum = function (a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1; // columns where both are 1 carry left
    a = a ^ b;                  // add each column, ignoring carries
    b = carry;                  // now add the carries the same way
  }
  // JS bitwise ops work on signed 32-bit values, so negatives behave like Java:
  // the carry falls off bit 31 and the loop ends
  return a;
};
