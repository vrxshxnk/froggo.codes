/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function (height) {
  let left = 0, right = height.length - 1;
  let best = 0;

  while (left < right) {
    // Water is capped by the shorter wall, times the distance between them
    const area = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, area);

    // The shorter wall can't do better with any closer partner:
    // the width shrinks and its own height still caps the water. Drop it.
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return best;
};
