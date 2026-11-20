/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (numbers, target) {
  let left = 0, right = numbers.length - 1;

  while (left < right) {
    const total = numbers[left] + numbers[right];
    if (total === target) {
      return [left + 1, right + 1]; // the answer is 1-indexed
    }
    if (total < target) {
      // numbers[left] is too small even with the biggest partner left,
      // so it can't be in any answer: drop it
      left++;
    } else {
      // numbers[right] is too big even with the smallest partner left
      right--;
    }
  }

  return []; // guaranteed answer, never reached
};
