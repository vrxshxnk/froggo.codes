/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function (height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0; // tallest bar seen so far from each end
  let water = 0;

  while (left < right) {
    // Move the side with the SHORTER wall. Its water level is decided:
    // the other side already has a wall at least this tall.
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
};
