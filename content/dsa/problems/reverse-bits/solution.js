/**
 * @param {number} n
 * @return {number}
 */
var reverseBits = function (n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    // Make room on the right of result, then drop in n's lowest bit.
    // The bit n gives up first ends up furthest left after 32 shifts.
    result = (result << 1) | (n & 1);
    n >>>= 1; // >>> shifts in 0s; >> would copy the sign bit
  }
  // JS bitwise ops return signed 32-bit values; >>> 0 reads the bits as unsigned
  return result >>> 0;
};
