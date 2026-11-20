/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function (nums) {
  let result = 0;
  for (let bit = 0; bit < 32; bit++) {
    // Every number that appears three times adds 0 or 3 to this column,
    // so whatever is left after % 3 is the single number's bit
    let count = 0;
    for (const x of nums) {
      count += (x >> bit) & 1;
    }
    if (count % 3 !== 0) {
      result |= 1 << bit; // JS bitwise ops are signed 32-bit, so bit 31 makes it negative
    }
  }
  return result;
};
